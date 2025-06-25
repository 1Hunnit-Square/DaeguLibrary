package com.dglib.controller.chatbot;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;


import com.dglib.security.jwt.JwtFilter;


import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
	

	private final WebClient webClient;
	private final Logger LOGGER = LoggerFactory.getLogger(ChatbotController.class);

	
	public ChatbotController(@Qualifier("webClientChat") WebClient webClient) {
        this.webClient = webClient;
	}
        
	
	
	@PostMapping("/chat")
	public Mono<ResponseEntity<String>> chatbotRequest(@RequestBody Map<String, String> requestBody) {
		String parts = requestBody.get("parts");
		String clientId = requestBody.get("clientId");
		String mid = JwtFilter.getMid();
		requestBody.put("mid", mid);
		LOGGER.info("Chatbot parts: {}, clientId: {}, mid: {}", parts, clientId, mid);
		return webClient.post().uri("/chatbot").body(Mono.just(requestBody), Map.class).retrieve()
				.bodyToMono(String.class).map(response -> {
					LOGGER.info("Chatbot response: {}", response);
					return ResponseEntity.ok(response);
				}).onErrorMap(original -> {
					LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
					return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
				});
	}
	
	@PostMapping("/reset")
	public Mono<ResponseEntity<String>> resetChatHistory(@RequestBody Map<String, String> requestBody) {
		String clientId = requestBody.get("clientId");
		LOGGER.info("Chatbot reset request for clientId: {}", clientId);
		return webClient.post().uri("/reset").body(Mono.just(requestBody), Map.class).retrieve()
				.bodyToMono(String.class).map(response -> {
					LOGGER.info("Chatbot reset response: {}", response);
					return ResponseEntity.ok(response);
				}).onErrorMap(original -> {
					LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
					return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
				});
	}
	
	@GetMapping("/checkaccess")
	public ResponseEntity<String> checkAccess() {
        String mid = JwtFilter.getMid();
        LOGGER.info("Checking access for mid: {}", mid);
        return ResponseEntity.ok().build();
    }
	
	@PostMapping("/feedback")
	public Mono<ResponseEntity<String>> feedback(@RequestBody Map<String, Object> requestBody) {
	    LOGGER.info("" + requestBody);
		return webClient.post().uri("/feedback").body(Mono.just(requestBody), Map.class).retrieve()
				.bodyToMono(String.class).map(response -> {
					LOGGER.info("Chatbot feedback response: {}", response);
					return ResponseEntity.ok(response);
				}).onErrorMap(original -> {
					LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
					return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
				});
	}
	
	
	
	

}
