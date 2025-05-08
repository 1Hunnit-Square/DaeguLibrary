package com.dglib.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dglib.dto.MemberDTO;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authHeader = request.getHeader("Authorization");
		String accessToken = authHeader.substring(7);
		
		Map<String, Object> claims = JwtProvider.validateToken(accessToken);
		
		String mid = (String) claims.get("mid");
	    String name = (String) claims.get("name");
	    String mno = (String) claims.get("mno");
	    String roleName = (String) claims.get("roleName");
		
		MemberDTO memberDTO = new MemberDTO(mid, null, name, mno, roleName);
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
		SecurityContextHolder.getContext().setAuthentication(authenticationToken);
		
		filterChain.doFilter(request, response);
	}

	
}
