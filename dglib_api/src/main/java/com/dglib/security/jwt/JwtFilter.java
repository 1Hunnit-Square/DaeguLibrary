package com.dglib.security.jwt;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
		log.info("FILETERING...");
		String authHeader = request.getHeader("Authorization");
		
		String accessToken = authHeader.substring(7);
		
		Map<String, Object> claims = JwtProvider.validateToken(accessToken);
		
		String mid = (String) claims.get("mid");
	    String name = (String) claims.get("name");
	    String mno = (String) claims.get("mno");
	    String roleName = (String) claims.get("roleName");
		
		MemberDTO memberDTO = new MemberDTO(mid, "", name, mno, roleName);
		
	
		
		
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
	    String authHeader = request.getHeader("Authorization");

	    
	    if (path.equals("/favicon.ico") || path.startsWith("/api/member/refresh")) {
			return true;
		}
	    

	    //회원 + 비회원
	    if(path.startsWith("/api/")) {
	          if(authHeader != null) {
	             return false; //회원의 경우
	          }
	           return true; //비회원의 경우
	       }

	    //이미지 조회 경로는 체크하지 않음
	    if(path.startsWith("/api/view/")) {
	        return true;
	    }
	    
	    
	    return false;
	    }
	 

		public static String getMid() {

		      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		      Object principal = authentication.getPrincipal();
		      if (principal == null || !(principal instanceof MemberDTO)) {
		         return null;
		      }
		      
		      return ((MemberDTO) principal).getUsername();
		      
		   }
		

		public static String getName() {

		      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		      Object principal = authentication.getPrincipal();
		      if (principal == null || !(principal instanceof MemberDTO)) {
		         return null;
		      }
		      
		      return ((MemberDTO) principal).getName();
		      
		   }
		
		public static String getRoleName() {

		      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		      Object principal = authentication.getPrincipal();
		      if (principal == null || !(principal instanceof MemberDTO)) {
		         return null;
		      }
		      
		      Collection<? extends GrantedAuthority> authorities = ((MemberDTO) principal).getAuthorities();
		      
		      List<String> roles = authorities.stream()
		    		    .map(GrantedAuthority::getAuthority)
		    		    .collect(Collectors.toList());
		      
		      return roles.get(0);
		   }

		public static String getMidFromSocket(StompHeaderAccessor headerAccessor) {
	        String authHeader = headerAccessor.getFirstNativeHeader("Authorization");
	        if (authHeader != null && authHeader.startsWith("Bearer ")) {
	            String token = authHeader.substring(7);
				if (token == null || token.isEmpty()) {
					return null;
				}
	            Map<String, Object> claims = JwtProvider.validateToken(token);
	            String mid = (String) claims.get("mid");
	    	    String name = (String) claims.get("name");
	    	    String mno = (String) claims.get("mno");
	    	    String roleName = (String) claims.get("roleName");
	    		MemberDTO memberDTO = new MemberDTO(mid, "", name, mno, roleName);
	    		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
	    		SecurityContextHolder.getContext().setAuthentication(authenticationToken);
	            return getMid(); 
	        }
	        return null;
	    }
		

		
	public static boolean checkAuth(String mid) {
		if((mid != null && JwtFilter.getMid() != null && JwtFilter.getMid().equals(mid)) || JwtFilter.getRoleName() !=null && JwtFilter.getRoleName().equals("ROLE_ADMIN"))
			return true;
		else
			return false;
	}
	
	public static boolean checkMember(String mid, boolean isPublic) {
		if(isPublic) {
			return true;
		} else
			return JwtFilter.checkAuth(mid);
	}
	
}
