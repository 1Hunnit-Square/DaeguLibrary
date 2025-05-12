package com.dglib.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import com.dglib.dto.member.MemberDTO;
import com.dglib.security.jwt.JwtProvider;
import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class LoginSuccessHandler implements AuthenticationSuccessHandler {
@Override
public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
		Authentication authentication) throws IOException, ServletException {
	MemberDTO memberDTO = (MemberDTO) authentication.getPrincipal();
	Map<String, Object> claims = memberDTO.getClaims();
	
	String accessToken = JwtProvider.generateToken(claims, 10);
    String refreshToken = JwtProvider.generateToken(claims,60*24);
    
    claims.put("accessToken", accessToken);
    claims.put("refreshToken", refreshToken);
	
	Gson gson = new Gson();
	String json = gson.toJson(claims);
	response.setContentType("application/json;charset=UTF-8");
	response.getWriter().println(json);
	
}
}
