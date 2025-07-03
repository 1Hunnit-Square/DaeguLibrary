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
import org.springframework.stereotype.Service;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class VoiceSessionServiceNetty {

    private final Logger LOGGER = LoggerFactory.getLogger(VoiceSessionServiceNetty.class);

    private final String pythonServerHost = "1.tcp.jp.ngrok.io";
    private final int pythonServerPort = 20882;
    private final ObjectMapper objectMapper;

    private EventLoopGroup workerGroup;
    private Bootstrap bootstrap;
    private final ConcurrentHashMap<String, Channel> activeSessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, WebSocketSession> clientSessions = new ConcurrentHashMap<>();

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
                        ch.pipeline().addLast(new VoiceClientHandler());
                    }
                });
        LOGGER.info("Netty Bootstrap Initialized");
    }

    public void startSession(String uuid, String clientId, String mid, WebSocketSession clientSession) {
        if (activeSessions.containsKey(uuid)) {
            LOGGER.warn("Session for UUID {} already exists. Re-initializing.", uuid);
            endSession(uuid);
        }
        try {
            ChannelFuture future = bootstrap.connect(pythonServerHost, pythonServerPort).sync();
            if (future.isSuccess()) {
                Channel channel = future.channel();
                channel.attr(AttributeKey.valueOf("uuid")).set(uuid);
                activeSessions.put(uuid, channel);
                clientSessions.put(uuid, clientSession);
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
        if (mid != null) {
            clientInfo.put("mid", mid);
        }
        byte[] jsonBytes = objectMapper.writeValueAsBytes(clientInfo);
        ByteBuf buffer = channel.alloc().buffer(4 + jsonBytes.length);
        buffer.writeInt(jsonBytes.length);
        buffer.writeBytes(jsonBytes);
        channel.writeAndFlush(buffer);
    }

    public void processAudioChunk(String uuid, byte[] audioData) {
        Channel channel = activeSessions.get(uuid);
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(Unpooled.wrappedBuffer(audioData));
        }
    }

    public void endSession(String uuid) {
        Channel session = activeSessions.remove(uuid);
        if (session != null && session.isOpen()) {
            session.close();
        }
        clientSessions.remove(uuid);
        LOGGER.info("Voice session ended for UUID: {}", uuid);
    }

    private void sendErrorToClient(String uuid, String errorMessage) {
        WebSocketSession session = clientSessions.get(uuid);
        if (session != null && session.isOpen()) {
            try {
                Map<String, String> errorPayload = Map.of("type", "error", "message", errorMessage);
                byte[] jsonBytes = objectMapper.writeValueAsBytes(errorPayload);
                ByteBuffer buffer = ByteBuffer.allocate(4 + jsonBytes.length);
                buffer.order(ByteOrder.BIG_ENDIAN);
                buffer.putInt(jsonBytes.length);
                buffer.put(jsonBytes);
                buffer.flip();
                session.sendMessage(new BinaryMessage(buffer));
            } catch (IOException e) {
                LOGGER.error("Failed to send error message to client for UUID: {}", uuid, e);
            }
        }
    }

    @PreDestroy
    public void cleanup() {
        activeSessions.keySet().forEach(this::endSession);
        if (workerGroup != null) {
            workerGroup.shutdownGracefully();
        }
    }

    private class VoiceClientHandler extends ChannelInboundHandlerAdapter {
        private ByteBuf buffer;
        private int expectedJsonLength = -1;
        private int expectedAudioLength = -1;
        private boolean headerRead = false;
        
        @Override
        public void handlerAdded(ChannelHandlerContext ctx) {
            buffer = ctx.alloc().buffer();
        }
        
        @Override
        public void handlerRemoved(ChannelHandlerContext ctx) {
            if (buffer != null) {
                buffer.release();
                buffer = null;
            }
        }
        
        @Override
        //데이터 조각이 도착할 때마다 호출됨
        public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
            if (!(msg instanceof ByteBuf)) {
                ctx.fireChannelRead(msg);
                return;
            }
            
            String uuid = ctx.channel().attr(AttributeKey.valueOf("uuid")).get().toString();
            ByteBuf data = (ByteBuf) msg;
            
            try {
                // 받은 데이터를 버퍼에 추가
                buffer.writeBytes(data);
                
                // 헤더를 아직 읽지 않았다면 헤더 파싱 시도
                if (!headerRead && buffer.readableBytes() >= 8) {
                    expectedJsonLength = buffer.readInt();
                    expectedAudioLength = buffer.readInt();
                    
                    // 길이 값 검증
                    if (expectedJsonLength < 0 || expectedAudioLength < 0 || 
                        expectedJsonLength > 10 * 1024 * 1024 || expectedAudioLength > 50 * 1024 * 1024) {
                        LOGGER.error("비정상적인 길이 값. UUID: {}, JSON: {}, Audio: {}", 
                                   uuid, expectedJsonLength, expectedAudioLength);
                        ctx.close();
                        return;
                    }
                    
                    headerRead = true;
                    LOGGER.debug("헤더 파싱 완료. UUID: {}, JSON: {}, Audio: {}", 
                               uuid, expectedJsonLength, expectedAudioLength);
                }
                
                // 전체 메시지가 도착했는지 확인
                if (headerRead && buffer.readableBytes() >= expectedJsonLength + expectedAudioLength) {
                    // JSON 데이터 읽기
                    byte[] jsonBytes = new byte[expectedJsonLength];
                    buffer.readBytes(jsonBytes);
                    
                    // 오디오 데이터 읽기
                    byte[] audioBytes = null;
                    if (expectedAudioLength > 0) {
                        audioBytes = new byte[expectedAudioLength];
                        buffer.readBytes(audioBytes);
                    }
                    
                    // 클라이언트에게 전송
                    WebSocketSession clientSession = clientSessions.get(uuid);
                    if (clientSession != null && clientSession.isOpen()) {
                        try {
                            // 클라이언트에게 보낼 패킷 구성
                            ByteBuffer responseBuffer = ByteBuffer.allocate(8 + expectedJsonLength + expectedAudioLength);
                            responseBuffer.order(ByteOrder.BIG_ENDIAN);
                            responseBuffer.putInt(expectedJsonLength);
                            responseBuffer.putInt(expectedAudioLength);
                            responseBuffer.put(jsonBytes);
                            if (audioBytes != null) {
                                responseBuffer.put(audioBytes);
                            }
                            responseBuffer.flip();
                            
                            clientSession.sendMessage(new BinaryMessage(responseBuffer));
                            
                            LOGGER.debug("클라이언트에게 응답 전송 완료. UUID: {}, 총 크기: {} bytes", 
                                       uuid, 8 + expectedJsonLength + expectedAudioLength);
                        } catch (IOException e) {
                            LOGGER.error("클라이언트에게 응답 전송 실패. UUID: {}", uuid, e);
                        }
                    } else {
                        LOGGER.warn("클라이언트 세션을 찾을 수 없습니다. UUID: {}", uuid);
                    }
                    
                    // 상태 초기화
                    headerRead = false;
                    expectedJsonLength = -1;
                    expectedAudioLength = -1;
                    buffer.clear();
                }
            } finally {
                data.release();
            }
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
            endSession(uuid);
            super.channelInactive(ctx);
        }
    }
}