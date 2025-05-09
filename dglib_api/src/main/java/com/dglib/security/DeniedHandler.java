package com.dglib.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class DeniedHandler implements AccessDeniedHandler {
	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException, ServletException {
		 Gson gson = new Gson();
		 String json = gson.toJson(Map.of("error", "ERROR_ACCESS_DENIED"));
		 response.setStatus(HttpStatus.FORBIDDEN.value());
		 response.setContentType("application/json;charset=UTF-8");
		 response.getWriter().println(json);
		
	}

}
