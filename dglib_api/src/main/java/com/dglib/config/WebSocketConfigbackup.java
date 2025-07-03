package com.dglib.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker

public class WebSocketConfigbackup implements WebSocketMessageBrokerConfigurer  {
	
	
	 @Override
	    public void registerStompEndpoints(StompEndpointRegistry registry) {
	        registry.addEndpoint("/api/chatbot/voice")
	                .setAllowedOriginPatterns("*")
	                .withSockJS();
	    }
	 
	 @Override
	    public void configureMessageBroker(MessageBrokerRegistry registry) {
	        registry.enableSimpleBroker("/topic", "/queue");
	        registry.setApplicationDestinationPrefixes("/app");
	        registry.setUserDestinationPrefix("/user");
	    }

}
