package com.dglib.controller.chatbot;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;


import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
	
	@Qualifier("webClientChat")
	private final WebClient webClient;
	private final Logger LOGGER = LoggerFactory.getLogger(ChatbotController.class);
	
	public ChatbotController(@Qualifier("webClientChat") WebClient webClient) {
        this.webClient = webClient;
    }
	
	
	@PostMapping("/chat")
	public Mono<ResponseEntity<String>> chatbotRequest(@RequestBody Map<String, String> requestBody) {
		String parts = requestBody.get("parts");
		String clientId = requestBody.get("clientId");
		LOGGER.info("Chatbot parts: {}, clientId: {}", parts, clientId);
		return webClient.post().uri("/chatbot").body(Mono.just(requestBody), Map.class).retrieve()
				.bodyToMono(String.class).map(response -> {
					LOGGER.info("Chatbot response: {}", response);
					return ResponseEntity.ok(response);
				}).onErrorMap(original -> {
					LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
					return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
				});
	}

}
