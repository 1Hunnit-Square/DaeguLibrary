package com.dglib.service.websocket;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
	public CompletableFuture<String> connectToPython(Map<String, String> message) {
		
		String messageType = message.get("type");
		if ("voice".equals(messageType)) {
			return sendVoiceMessage(message);
		} else {
			return sendTextMessage(message);
		}
	}
	
	
	private CompletableFuture<String> sendTextMessage(Map<String, String> message) {
		try (Socket pythonSocket = new Socket(pythonServerHost, pythonServerPort)) {
			
			LOGGER.info("Connected to Python server at {}:{}", pythonServerHost, pythonServerPort);
			
			OutputStream outputStream = pythonSocket.getOutputStream();
			
			String jsonPayload = objectMapper.writeValueAsString(message);
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
			
		} catch (IOException e) {
			LOGGER.error("Error connecting to Python server", e);
			return CompletableFuture.failedFuture(e);
		}
	}
	
	
	private CompletableFuture<String> sendVoiceMessage(Map<String, String> message) {
		try (Socket pythonSocket = new Socket(pythonServerHost, pythonServerPort)) {
			
			LOGGER.info("Connected to Python server for voice at {}:{}", pythonServerHost, pythonServerPort);
			
			OutputStream outputStream = pythonSocket.getOutputStream();
			
			
			Map<String, Object> voicePayload = new HashMap<>();
			voicePayload.put("type", "voice");
			voicePayload.put("clientId", message.get("clientId"));
			voicePayload.put("timestamp", message.get("timestamp"));
			
			
			String base64AudioData = message.get("audioData");
			byte[] audioBytes = Base64.getDecoder().decode(base64AudioData);
			
			
			String metadataJson = objectMapper.writeValueAsString(voicePayload);
			byte[] metadataBytes = metadataJson.getBytes(StandardCharsets.UTF_8);
			
			
			ByteBuffer buffer = ByteBuffer.allocate(4 + metadataBytes.length + 4 + audioBytes.length);
			buffer.order(ByteOrder.BIG_ENDIAN);
			
		
			buffer.putInt(metadataBytes.length);
			buffer.put(metadataBytes);
			
			
			buffer.putInt(audioBytes.length);
			buffer.put(audioBytes);
			
			
			outputStream.write(buffer.array());
			outputStream.flush();
			
			LOGGER.info("Voice data sent - Metadata: {} bytes, Audio: {} bytes", 
						metadataBytes.length, audioBytes.length);
			
			
			InputStream inputStream = pythonSocket.getInputStream();
			byte[] lengthBytes = inputStream.readNBytes(4);
			
			if (lengthBytes.length < 4) {
				throw new IOException("응답 메시지 길이를 수신하지 못했습니다.");
			}
			
			int responseLength = ByteBuffer.wrap(lengthBytes).order(ByteOrder.BIG_ENDIAN).getInt();
			byte[] responseBytes = inputStream.readNBytes(responseLength);
			String receivedResponse = new String(responseBytes, StandardCharsets.UTF_8);
			
			LOGGER.info("Received voice response from Python server: {}", receivedResponse);
			
			return CompletableFuture.completedFuture(receivedResponse);
			
		} catch (IOException e) {
			LOGGER.error("Error sending voice data to Python server", e);
			return CompletableFuture.failedFuture(e);
		} catch (IllegalArgumentException e) {
			LOGGER.error("Invalid Base64 audio data", e);
			return CompletableFuture.failedFuture(new IOException("잘못된 오디오 데이터 형식", e));
		}
	}
}