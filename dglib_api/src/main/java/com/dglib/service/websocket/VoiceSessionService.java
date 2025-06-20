package com.dglib.service.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class VoiceSessionService {

    private final Logger LOGGER = LoggerFactory.getLogger(VoiceSessionService.class);
    
    private final String pythonServerHost = "1.tcp.jp.ngrok.io";
    private final int pythonServerPort = 20882;
    
    
    private static final int BATCH_SIZE_BYTES = 8192; 
    
    
    private static final long SESSION_TIMEOUT_MS = 15000; 

    private final SimpMessageSendingOperations messagingTemplate;
    private final ObjectMapper objectMapper;
    
    private final ConcurrentHashMap<String, VoiceSession> activeSessions = new ConcurrentHashMap<>();
    
    private final AtomicInteger threadCounter = new AtomicInteger(0);

    private class AudioBatch {
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        private final Object lock = new Object();
        
        void addChunk(byte[] chunk, VoiceSession session) {
            synchronized (lock) {
                try {
                    buffer.write(chunk);
                    
                    if (buffer.size() >= BATCH_SIZE_BYTES) {
                        flushNow(session);
                    }
                } catch (IOException e) {
                    LOGGER.error("Error adding chunk to batch", e);
                }
            }
        }
        
        private void flushNow(VoiceSession session) {
            if (buffer.size() > 0) {
                byte[] batchData = buffer.toByteArray();
                buffer.reset();
                
                try {
                    session.send(batchData);
                    LOGGER.debug("Flushed batch of {} bytes", batchData.length);
                } catch (IOException e) {
                    LOGGER.error("Error flushing batch", e);
                }
            }
        }
        
        void forceFlush(VoiceSession session) {
            synchronized (lock) {
                flushNow(session);
            }
        }
        
        void cleanup() {
            synchronized (lock) {
                try {
                    buffer.close();
                } catch (IOException e) {
                    LOGGER.error("Error closing buffer", e);
                }
            }
        }
    }

    private class VoiceSession {
        final Socket socket;
        final OutputStream outputStream;
        final Thread listenerThread;
        final AudioBatch audioBatch;
        final String clientId;
        final String mid;
        volatile long lastActivity; 

        VoiceSession(Socket socket, Thread listenerThread, String clientId, String mid) throws IOException {
            this.socket = socket;
            this.outputStream = socket.getOutputStream();
            this.listenerThread = listenerThread;
            this.audioBatch = new AudioBatch();
            this.lastActivity = System.currentTimeMillis();
            this.clientId = clientId;
            this.mid = mid;
        }
        
        void updateActivity() {
            this.lastActivity = System.currentTimeMillis();
        }

        void send(byte[] data) throws IOException {
            if (socket.isClosed() || !socket.isConnected()) {
                throw new IOException("Socket is not connected.");
            }
            outputStream.write(data);
            outputStream.flush();
        }
        
        void addToBatch(byte[] audioData) {
            updateActivity();
            audioBatch.addChunk(audioData, this);
        }
        
        void flushBatch() {
            audioBatch.forceFlush(this);
        }

        void close() {
            try {
                
                audioBatch.forceFlush(this);
                audioBatch.cleanup();
                
                if (listenerThread != null && listenerThread.isAlive()) {
                    listenerThread.interrupt();
                }
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
                
                int currentCount = threadCounter.decrementAndGet();
                LOGGER.debug("Voice listener thread terminated. Active threads: {}", currentCount);
                
            } catch (IOException e) {
                LOGGER.error("Error closing socket for session.", e);
            }
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() - lastActivity > SESSION_TIMEOUT_MS;
        }
    }

    public void startSession(String uuid, String clientId, String mid) {
        if (activeSessions.containsKey(uuid)) {
            LOGGER.warn("Session for UUID {} already exists. Re-initializing.", uuid);
            endSession(uuid);
        }

        try {
            LOGGER.info("Attempting to connect to Python server at {}:{} for UUID: {}", 
                       pythonServerHost, pythonServerPort, uuid);
            Socket socket = new Socket(pythonServerHost, pythonServerPort);
            socket.setTcpNoDelay(false); 
            socket.setSendBufferSize(16384); 
            
            
            
            LOGGER.info("✅ Successfully connected to Python server for UUID: {}", uuid);

            Thread listenerThread = new Thread(() -> listenForResponses(uuid, socket));
            listenerThread.setName("VoiceListener-" + uuid + "-" + threadCounter.incrementAndGet());
            listenerThread.setDaemon(true); 
            
            
            
            VoiceSession session = new VoiceSession(socket, listenerThread, clientId, mid);
            sendClientIdToPython(socket, clientId, mid);
            activeSessions.put(uuid, session);
            
            listenerThread.start();
            
            int currentThreads = threadCounter.get();
            LOGGER.info("Voice session started for UUID: {}. Active listener threads: {}", uuid, currentThreads);

        } catch (IOException e) {
            LOGGER.error("Failed to start voice session for UUID: {}. Error: {}", uuid, e.getMessage());
            sendErrorToClient(uuid, "음성 처리 서버에 연결할 수 없습니다.");
        }
    }
    
    private void sendClientIdToPython(Socket socket, String clientId, String mid) throws IOException {
        try {
        	Map<String, String> clientInfo = new HashMap<>();
        	clientInfo.put("clientId", clientId); 
        	clientInfo.put("mid", mid);
            String clientInfoJson = objectMapper.writeValueAsString(clientInfo);
            byte[] clientInfoBytes = clientInfoJson.getBytes(StandardCharsets.UTF_8);
            
           
            byte[] lengthBytes = ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN).putInt(clientInfoBytes.length).array();
            
            OutputStream outputStream = socket.getOutputStream();
            outputStream.write(lengthBytes);
            outputStream.write(clientInfoBytes);
            outputStream.flush();
            
            LOGGER.debug("Sent clientId to Python server: {}", clientId);
        } catch (IOException e) {
            LOGGER.error("Failed to send clientId to Python server", e);
            throw e;
        }
    }

    public void processAudioChunk(String uuid, byte[] audioData) {
        VoiceSession session = activeSessions.get(uuid);
        if (session != null) {
            try {
                session.addToBatch(audioData); 
            } catch (Exception e) {
                LOGGER.error("Failed to add audio chunk to batch for UUID: {}. Error: {}", uuid, e.getMessage());
                endSession(uuid);
            }
        } else {
            LOGGER.warn("No active session found for UUID: {} to process audio chunk.", uuid);
        }
    }
    
    public void flushSession(String uuid) {
        VoiceSession session = activeSessions.get(uuid);
        if (session != null) {
            session.flushBatch();
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
            LOGGER.debug("Listener thread started for UUID: {}", uuid);
            
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
                
                
                VoiceSession session = activeSessions.get(uuid);
                if (session != null) {
                    session.updateActivity();
                }
                
                Map<String, Object> responsePayload = objectMapper.readValue(responseJson, Map.class);
                messagingTemplate.convertAndSend("/topic/response/" + uuid, responsePayload);
            }
        } catch (IOException e) {
            if (!socket.isClosed()) {
                LOGGER.error("Error while listening for responses for UUID: {}. Error: {}", uuid, e.getMessage());
                sendErrorToClient(uuid, "서버 연결이 끊어졌습니다.");
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


    public int getActiveSessionCount() {
        return activeSessions.size();
    }

    @PreDestroy
    public void cleanup() {
        LOGGER.info("Shutting down VoiceSessionService. Closing all active sessions.");
        activeSessions.keySet().forEach(this::endSession);
        
        LOGGER.info("VoiceSessionService shutdown completed.");
    }
}