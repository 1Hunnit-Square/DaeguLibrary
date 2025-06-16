package com.dglib.controller.chatbot;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.dglib.service.websocket.TcpClientService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class StompController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(StompController.class);
	private final TcpClientService tcpClientService;
	private final SimpMessageSendingOperations messagingTemplate;
	private final ObjectMapper objectMapper;
	
	@MessageMapping("/start")
	public void handleTestRequest(Map<String, String> messeage) {
		 String uuid = messeage.get("uuid");
		 
		 String destination = "/topic/response/" + uuid;
		 try {
	            CompletableFuture<String> futureResult = tcpClientService.connectToPython(messeage);

	            futureResult.whenComplete((result, error) -> {
	            	Map<String, Object> responsePayload = new HashMap<>();
	                if (error != null) {
	                    LOGGER.error("비동기 작업 실패: " + error.getMessage());
	                    responsePayload.put("status", "error");
	                    responsePayload.put("message", "파이썬 서버 통신 오류");
	                } else {
	                    LOGGER.info("비동기 작업 성공: " + result);
	                    responsePayload.put("status", "python-response");
	                    responsePayload.put("message", result); 
	                }
	                
	                messagingTemplate.convertAndSend(destination, responsePayload);
	            });

	        } catch (TaskRejectedException e) {
	            LOGGER.error("비동기 작업이 거부되었습니다: " + e.getMessage());
	            String busyMessage = "{\"status\":\"error\", \"message\":\"서버가 너무 바쁩니다.\"}";
	            messagingTemplate.convertAndSend(destination, busyMessage);
	        }
	    }
	
	@MessageMapping("/voice")
    public void handleVoiceMessage(Map<String, String> messeage) {
		LOGGER.info("음성 메시지 수신: " + messeage);
        try {
        	String uuid = messeage.get("uuid");
            
            String destination = "/topic/response/" + uuid;
            
         
            try {
                
                CompletableFuture<String> futureResult = tcpClientService.connectToPython(messeage);
                
                futureResult.whenComplete((result, error) -> {
                    Map<String, Object> responsePayload = new HashMap<>();
                    if (error != null) {
                        LOGGER.error("음성 처리 실패: " + error.getMessage());
                        responsePayload.put("type", "error");
                        responsePayload.put("uuid", uuid);
                        responsePayload.put("message", "음성 처리 중 오류가 발생했습니다.");
                    } else {
                        LOGGER.info("음성 처리 성공: " + result);
                        
                        try {
                            
                            JsonNode pythonResponse = objectMapper.readTree(result);
                            
                            responsePayload.put("type", "voice_response");
                            responsePayload.put("uuid", uuid);
                            responsePayload.put("message", pythonResponse.get("message").asText());
                            responsePayload.put("timestamp", System.currentTimeMillis());
                            
                            if (pythonResponse.has("text")) {
                                responsePayload.put("text", pythonResponse.get("text").asText());
                                responsePayload.put("triggerSaying", true);
                            }
                            
                        } catch (Exception e) {
                            LOGGER.error("파이썬 응답 파싱 오류", e);
                            responsePayload.put("type", "error");
                            responsePayload.put("message", "응답 처리 중 오류가 발생했습니다.");
                        }
                    }
                    
                    messagingTemplate.convertAndSend(destination, responsePayload);
                });
                
            } catch (TaskRejectedException e) {
                LOGGER.error("음성 처리 작업이 거부되었습니다: " + e.getMessage());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("type", "error");
                errorResponse.put("uuid", uuid);
                errorResponse.put("message", "서버가 너무 바쁩니다. 잠시 후 다시 시도해주세요.");
                messagingTemplate.convertAndSend(destination, errorResponse);
            }
            
        } catch (Exception e) {
            LOGGER.error("음성 메시지 처리 중 오류", e);
        }
    }
}


