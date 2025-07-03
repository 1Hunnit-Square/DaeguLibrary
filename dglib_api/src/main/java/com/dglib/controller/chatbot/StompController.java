//package com.dglib.controller.chatbot;
//
//import com.dglib.security.jwt.JwtFilter;
//
//import com.dglib.service.websocket.VoiceSessionServiceNetty;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.stereotype.Controller;
//
//import java.io.IOException;
//import java.util.Base64;
//import java.util.Map;
//
//@Controller
//@RequiredArgsConstructor
//public class StompController {
//
//    private final Logger LOGGER = LoggerFactory.getLogger(StompController.class);
//    private final VoiceSessionServiceNetty voiceSessionService;
//    private final ObjectMapper objectMapper;
//
//    @MessageMapping("/voice")
//    public void handleVoiceMessage(String payload, StompHeaderAccessor headerAccessor) {
//    	
//    	 
//    	        
//        try {
//           
//            Map<String, String> message = objectMapper.readValue(payload, Map.class);
//            String type = message.get("type");
//            String uuid = message.get("uuid");
//            String clientId = message.get("clientId");
//
//            if (uuid == null || type == null) {
//                LOGGER.error("Invalid message: 'uuid' or 'type' is missing. Payload: {}", payload);
//                return;
//            }
//
//            
//
//            switch (type) {
//                case "start_session":
//                	String mid;
//                	try {
//                    	mid = JwtFilter.getMidFromSocket(headerAccessor);
//                    	LOGGER.info("Received voice message from mid: {}", mid);
//                    	
//        			} catch (Exception e) {
//        				LOGGER.error("검증실패" + e);
//        				return;
//        			}
//                    voiceSessionService.startSession(uuid, clientId, mid);
//                    break;
//                case "audio_chunk":
//
////                    LOGGER.debug("Executing 'audio_chunk' for UUID: {}", uuid); 
//                    String base64AudioData = message.get("audioData");
//                    if (base64AudioData != null) {
//                        try {
//                            byte[] audioData = Base64.getDecoder().decode(base64AudioData);
//                            voiceSessionService.processAudioChunk(uuid, audioData);
//                        } catch (IllegalArgumentException e) {
//                            LOGGER.error("Invalid Base64 audio data for UUID: {}", uuid, e);
//                        }
//                    } else {
//                        LOGGER.warn("Received 'audio_chunk' without 'audioData' for UUID: {}", uuid);
//                    }
//                    break;
//                case "end_session":
//                    voiceSessionService.endSession(uuid);
//                    break;
//                	
//                default:
//                    LOGGER.warn("Unknown message type '{}' for UUID: {}", type, uuid);
//                    break;
//            }
//        } catch (IOException e) {
//            LOGGER.error("Failed to process voice message payload.", e);
//        } catch (IllegalArgumentException e) {
//            LOGGER.error("Invalid Base64 audio data.", e);
//        }
//    }
//}