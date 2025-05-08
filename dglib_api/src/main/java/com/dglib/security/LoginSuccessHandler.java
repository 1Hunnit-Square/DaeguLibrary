package com.dglib.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import com.dglib.dto.MemberDTO;

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
	
	
	response.setContentType("text/plain;charset=UTF-8");
	response.getWriter().println("로그인 완료");
	
}
}
