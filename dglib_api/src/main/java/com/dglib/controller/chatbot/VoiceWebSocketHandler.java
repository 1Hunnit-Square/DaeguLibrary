package com.dglib.controller.chatbot;


import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.websocket.VoiceSessionServiceNetty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class VoiceWebSocketHandler extends TextWebSocketHandler {

    private final Logger LOGGER = LoggerFactory.getLogger(VoiceWebSocketHandler.class);
    private final VoiceSessionServiceNetty voiceSessionService;
    private final ObjectMapper objectMapper;
    
    
    private final Map<WebSocketSession, String> sessionToUuidMap = new ConcurrentHashMap<>();
    private final Map<String, WebSocketSession> uuidToSessionMap = new ConcurrentHashMap<>();

    private static final byte MESSAGE_TYPE_AUDIO_CHUNK = 1;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        LOGGER.info("웹소켓 연결이 설정됨: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    	
        try {
            String payload = message.getPayload();
            Map<String, Object> msgMap = objectMapper.readValue(payload, Map.class);
            String type = (String) msgMap.get("type");
            String uuid = (String) msgMap.get("uuid");

            if (uuid == null || type == null) {
                
                return;
            }

            switch (type) {
                case "start_session":
                    String clientId = (String) msgMap.get("clientId");
                    String token = (String) msgMap.get("token");
                    String mid = null;

                    if (token != null) {
                        try {
                            mid = JwtFilter.getMid();
                        } catch (Exception e) {
                            LOGGER.warn("Token validation failed for UUID {}: {}", uuid, e.getMessage());
                        }
                    }
                    
                    uuidToSessionMap.put(uuid, session);
                    sessionToUuidMap.put(session, uuid);
                    
                    voiceSessionService.startSession(uuid, clientId, mid, session);
                    break;
                
                case "end_session":
                    voiceSessionService.endSession(uuid);
                    cleanupSession(session);
                    break;
                
                default:
                    LOGGER.warn("Unknown text message type '{}' for UUID: {}", type, uuid);
                    break;
            }
        } catch (IOException e) {
            LOGGER.error("Failed to process text message.", e);
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        String uuid = sessionToUuidMap.get(session);
        if (uuid == null) {
            
            return;
        }

        ByteBuffer payload = message.getPayload();
        if (payload.remaining() < 1) {
            return;
        }

        byte messageType = payload.get();

        if (messageType == MESSAGE_TYPE_AUDIO_CHUNK) {
            byte[] audioData = new byte[payload.remaining()];
            payload.get(audioData);
            
            voiceSessionService.processAudioChunk(uuid, audioData);
        } 
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        cleanupSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        
        cleanupSession(session);
    }
    
    private void cleanupSession(WebSocketSession session) {
        String uuid = sessionToUuidMap.remove(session);
        if (uuid != null) {
            uuidToSessionMap.remove(uuid);
           
            voiceSessionService.endSession(uuid);
        }
    }
}