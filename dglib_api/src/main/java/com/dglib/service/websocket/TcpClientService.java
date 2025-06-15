package com.dglib.service.websocket;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class TcpClientService {
	
	private final String pythonServerHost = "1.tcp.jp.ngrok.io";
	private final int pythonServerPort = 20882;
	private final ObjectMapper objectMapper;
	private final Logger LOGGER = LoggerFactory.getLogger(TcpClientService.class);
	
	@Async("tcpTaskExecutor")
	public CompletableFuture<String> connectToPython(Map<String, String> messeage) {
		
	try (Socket pythonSocket = new Socket(pythonServerHost, pythonServerPort)){
		
				LOGGER.info("Connected to Python server at {}:{}", pythonServerHost, pythonServerPort);
		
				OutputStream outputStream = pythonSocket.getOutputStream();
				
				String jsonPayload = objectMapper.writeValueAsString(messeage);
	            byte[] payloadBytes = jsonPayload.getBytes(StandardCharsets.UTF_8);
	            int payloadLength = payloadBytes.length;
	            
	            ByteBuffer lengthBuffer = ByteBuffer.allocate(4);
	            lengthBuffer.order(ByteOrder.BIG_ENDIAN);
	            lengthBuffer.putInt(payloadLength);
	            byte[] lengthBytesToSend = lengthBuffer.array();
	            
	            outputStream.write(lengthBytesToSend);
	            outputStream.write(payloadBytes);
	            outputStream.flush();
	           
				
				
				InputStream inputStream = pythonSocket.getInputStream();
				byte[] lengthBytes = inputStream.readNBytes(4);
				
				if (lengthBytes.length < 4) {
	                throw new IOException("메시지 길이를 수신하지 못했습니다.");
	            }
				int messageLength = ByteBuffer.wrap(lengthBytes).order(ByteOrder.BIG_ENDIAN).getInt();
				
				byte[] messageBytes = inputStream.readNBytes(messageLength);
	            String receivedMessage = new String(messageBytes, StandardCharsets.UTF_8);
	            
	            LOGGER.info("Received message from Python server: {}", receivedMessage);
	            
	            String replyMessage = "{\"status\":\"python-response\", \"message\":\"" + receivedMessage + "\"}";
	            
	            return CompletableFuture.completedFuture(replyMessage);
				
	
			} catch (IOException  e) {
				LOGGER.error("Error connecting to Python server", e);
				
				LOGGER.info("파이썬 서버와 통신 중 오류: " + e.getMessage());
	            
	            return CompletableFuture.failedFuture(e);
			}
			
		}

}
