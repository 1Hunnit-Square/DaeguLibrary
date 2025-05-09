package com.dglib.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class LoginFailHandler implements AuthenticationFailureHandler {
	
@Override
public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
		AuthenticationException exception) throws IOException, ServletException {
	
	 Gson gson = new Gson();
     String json = gson.toJson(Map.of("error", "LOGIN_FAILED"));
     
	response.setContentType("application/json;charset=UTF-8");
	response.getWriter().println(json);
	
}
}
