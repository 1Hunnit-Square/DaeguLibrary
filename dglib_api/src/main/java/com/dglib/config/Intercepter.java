package com.dglib.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class Intercepter implements HandlerInterceptor {
	
	Logger LOGGER = LoggerFactory.getLogger(Intercepter.class);
	
	
	@Value("${chatbot.api.key}")
    private String secretKey;
	
	@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		
		
        
       
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        
        
        String apiKey = request.getHeader("X-API-Key");
        
        if (apiKey == null || apiKey.isEmpty()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Missing API Key\"}");
            return false;
        }
        
        if (!secretKey.equals(apiKey)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Invalid API Key\"}");
            return false;
        }
        
        return true;
    }
}