package com.dglib.service.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class VoiceSessionService_backup {

    private final Logger LOGGER = LoggerFactory.getLogger(VoiceSessionService_backup.class);
    
	private final String pythonServerHost = "1.tcp.jp.ngrok.io";
	private final int pythonServerPort = 20882;
      

    private final SimpMessageSendingOperations messagingTemplate;
    private final ObjectMapper objectMapper;
    
    private final ConcurrentHashMap<String, VoiceSession> activeSessions = new ConcurrentHashMap<>();
    private final ExecutorService listenerExecutor = Executors.newCachedThreadPool();

   
    private class VoiceSession {
        final Socket socket;
        final OutputStream outputStream;
        final Thread listenerThread;

        VoiceSession(Socket socket, Thread listenerThread) throws IOException {
            this.socket = socket;
            this.outputStream = socket.getOutputStream();
            this.listenerThread = listenerThread;
        }

        void send(byte[] data) throws IOException {
            if (socket.isClosed() || !socket.isConnected()) {
                throw new IOException("Socket is not connected.");
            }
            outputStream.write(data);
            outputStream.flush();
        }

        void close() {
            try {
                if (listenerThread != null && listenerThread.isAlive()) {
                    listenerThread.interrupt();
                }
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
            } catch (IOException e) {
                LOGGER.error("Error closing socket for session.", e);
            }
        }
    }

    public void startSession(String uuid) {
        if (activeSessions.containsKey(uuid)) {
            LOGGER.warn("Session for UUID {} already exists. Re-initializing.", uuid);
            endSession(uuid);
        }

        try {
            LOGGER.info("Attempting to connect to Python server at {}:{} for UUID: {}", pythonServerHost, pythonServerPort, uuid);
            Socket socket = new Socket(pythonServerHost, pythonServerPort);
            LOGGER.info("✅ Successfully connected to Python server for UUID: {}", uuid);

            Thread listenerThread = new Thread(() -> listenForResponses(uuid, socket));
            
            VoiceSession session = new VoiceSession(socket, listenerThread);
            activeSessions.put(uuid, session);
            
            listenerExecutor.submit(listenerThread);

        } catch (IOException e) {
            LOGGER.error("Failed to start voice session for UUID: {}. Error: {}", uuid, e.getMessage());
            sendErrorToClient(uuid, "음성 처리 서버에 연결할 수 없습니다.");
        }
    }
    


    public void processAudioChunk(String uuid, byte[] audioData) {
        VoiceSession session = activeSessions.get(uuid);
        if (session != null) {
            try {
                session.send(audioData);
            } catch (IOException e) {
                LOGGER.error("Failed to send audio chunk for UUID: {}. Closing session. Error: {}", uuid, e.getMessage());
                endSession(uuid);
            }
        } else {
            LOGGER.warn("No active session found for UUID: {} to process audio chunk.", uuid);
        }
    }

    public void endSession(String uuid) {
        VoiceSession session = activeSessions.remove(uuid);
        if (session != null) {
            session.close();
            LOGGER.info("Voice session ended and cleaned up for UUID: {}", uuid);
        }
    }

    private void listenForResponses(String uuid, Socket socket) {
        try (InputStream inputStream = socket.getInputStream()) {
            while (!Thread.currentThread().isInterrupted() && !socket.isClosed()) {
                byte[] lengthBytes = inputStream.readNBytes(4);
                if (lengthBytes.length < 4) {
                    if (socket.isClosed() || Thread.currentThread().isInterrupted()) break;
                    throw new IOException("Failed to read response length from Python server.");
                }
                int responseLength = ByteBuffer.wrap(lengthBytes).order(ByteOrder.BIG_ENDIAN).getInt();

                byte[] responseBytes = inputStream.readNBytes(responseLength);
                String responseJson = new String(responseBytes, StandardCharsets.UTF_8);

                LOGGER.info("Received response from Python for UUID {}: {}", uuid, responseJson);
                
                Map<String, Object> responsePayload = objectMapper.readValue(responseJson, Map.class);
                messagingTemplate.convertAndSend("/topic/response/" + uuid, responsePayload);
            }
        } catch (IOException e) {
            if (!socket.isClosed()) {
                LOGGER.error("Error while listening for responses for UUID: {}. Error: {}", uuid, e.getMessage());
            }
        } finally {
            LOGGER.info("Listener thread for UUID {} is terminating.", uuid);
            endSession(uuid);
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
        listenerExecutor.shutdownNow();
    }
}