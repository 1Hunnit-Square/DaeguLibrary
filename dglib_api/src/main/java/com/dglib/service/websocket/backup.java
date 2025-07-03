package com.dglib.service.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
import io.netty.util.AttributeKey;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class backup {

    private final Logger LOGGER = LoggerFactory.getLogger(backup.class);

    private final String pythonServerHost = "1.tcp.jp.ngrok.io";
    private final int pythonServerPort = 20882;

    private final SimpMessageSendingOperations messagingTemplate;
    private final ObjectMapper objectMapper;

    private EventLoopGroup workerGroup;
    private Bootstrap bootstrap;
    private final ConcurrentHashMap<String, Channel> activeSessions = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.workerGroup = new NioEventLoopGroup();
        this.bootstrap = new Bootstrap();
        bootstrap.group(workerGroup)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.SO_KEEPALIVE, true)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        // Python -> Java 응답 프로토콜: [길이(4바이트)][JSON 데이터]
                        ch.pipeline().addLast(new LengthFieldBasedFrameDecoder(ByteOrder.BIG_ENDIAN, Integer.MAX_VALUE, 0, 4, 0, 4, true));
                        ch.pipeline().addLast(new VoiceClientHandler());
                    }
                });
        LOGGER.info("Netty Bootstrap Initialized (Original Protocol)");
    }

    public void startSession(String uuid, String clientId, String mid) {
        if (activeSessions.containsKey(uuid)) {
            LOGGER.warn("Session for UUID {} already exists. Re-initializing.", uuid);
            endSession(uuid);
        }
        try {
            LOGGER.info("Attempting to connect to Python server at {}:{}", pythonServerHost, pythonServerPort);
            ChannelFuture future = bootstrap.connect(pythonServerHost, pythonServerPort).sync();

            if (future.isSuccess()) {
                Channel channel = future.channel();
                channel.attr(AttributeKey.valueOf("uuid")).set(uuid);
                activeSessions.put(uuid, channel);
                sendClientInfoToPython(channel, clientId, mid);
                LOGGER.info("✅ Successfully connected to Python server for UUID: {}", uuid);
            } else {
                throw new IOException("Failed to connect", future.cause());
            }
        } catch (Exception e) {
            LOGGER.error("Failed to start voice session for UUID: {}.", uuid, e);
            sendErrorToClient(uuid, "음성 처리 서버 연결에 실패했습니다.");
        }
    }

    private void sendClientInfoToPython(Channel channel, String clientId, String mid) throws JsonProcessingException {
        Map<String, String> clientInfo = new HashMap<>();
        clientInfo.put("clientId", clientId);
        clientInfo.put("mid", mid);
        byte[] jsonBytes = objectMapper.writeValueAsBytes(clientInfo);
        ByteBuf buffer = channel.alloc().buffer(4 + jsonBytes.length);
        buffer.writeInt(jsonBytes.length);
        buffer.writeBytes(jsonBytes);
        channel.writeAndFlush(buffer);
        LOGGER.debug("Sent client info [Length + JSON] to Python.");
    }

    public void processAudioChunk(String uuid, byte[] audioData) {
        Channel channel = activeSessions.get(uuid);
        if (channel != null && channel.isActive()) {
            ByteBuf buffer = Unpooled.wrappedBuffer(audioData);
            channel.writeAndFlush(buffer);
        } else {
            LOGGER.warn("No active session found for UUID: {} to process audio chunk. Dropping data.", uuid);
        }
    }

    public void endSession(String uuid) {
        Channel session = activeSessions.remove(uuid);
        if (session != null) {
            session.close();
            LOGGER.info("Voice session ended for UUID: {}", uuid);
        }
    }

    private void sendErrorToClient(String uuid, String errorMessage) {
        Map<String, String> errorPayload = Map.of(
            "type", "error",
            "message", errorMessage
        );
        messagingTemplate.convertAndSend("/topic/response/" + uuid, errorPayload);
    }

    @PreDestroy
    public void cleanup() {
        LOGGER.info("Shutting down VoiceSessionService. Closing all active sessions.");
        activeSessions.keySet().forEach(this::endSession);
        if (workerGroup != null) {
            workerGroup.shutdownGracefully();
        }
        LOGGER.info("VoiceSessionService shutdown completed.");
    }

    private class VoiceClientHandler extends SimpleChannelInboundHandler<ByteBuf> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
            String uuid = ctx.channel().attr(AttributeKey.valueOf("uuid")).get().toString();
            byte[] responseBytes = new byte[msg.readableBytes()];
            msg.readBytes(responseBytes);
            String responseJson = new String(responseBytes, StandardCharsets.UTF_8);

            LOGGER.info("Received response from Python for UUID {}: {}", uuid, responseJson);
            
            Map<String, Object> responsePayload = objectMapper.readValue(responseJson, Map.class);
            messagingTemplate.convertAndSend("/topic/response/" + uuid, responsePayload);
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            String uuid = ctx.channel().attr(AttributeKey.valueOf("uuid")).get().toString();
            LOGGER.error("Netty handler error for UUID: {}. Closing connection.", uuid, cause);
            ctx.close();
        }

        @Override
        public void channelInactive(ChannelHandlerContext ctx) throws Exception {
            String uuid = ctx.channel().attr(AttributeKey.valueOf("uuid")).get().toString();
            LOGGER.warn("Channel for UUID {} became inactive. Cleaning up.", uuid);
            endSession(uuid);
            super.channelInactive(ctx);
        }
    }
}