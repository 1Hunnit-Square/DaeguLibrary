package com.dglib.controller.chatbot;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.dglib.service.websocket.TcpClientService;


import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class StompController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(StompController.class);
	private final TcpClientService tcpClientService;
	private final SimpMessageSendingOperations messagingTemplate;
	
	@MessageMapping("/start")
	public void handleTestRequest(Map<String, String> messeage) {
		 String clientId = messeage.get("clientId");
		 
		 String destination = "/topic/response/" + clientId;
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
}


