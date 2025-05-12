package com.dglib.security.jwt;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dglib.dto.member.MemberDTO;
import com.google.gson.Gson;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class JwtFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
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
		
		} catch(Exception e){
		    log.error(e.getMessage());

		    Gson gson = new Gson();
		    String json = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

		    response.setContentType("application/json;charset=UTF-8");
			response.getWriter().println(json);

		    }
	}
	
	 @Override
	    protected boolean shouldNotFilter(HttpServletRequest request)
	    throws ServletException {
	    
	    String path = request.getRequestURI();
	    
	    //멤버 로그인 경로의 호출은 체크하지 않음
	    if(path.startsWith("/api/member/")) {
	        return true;
	    }
	    
	    //이미지 조회 경로는 체크하지 않음
	    if(path.startsWith("/api/view/")) {
	        return true;
	    }

	    return false;
	    }

	
}
