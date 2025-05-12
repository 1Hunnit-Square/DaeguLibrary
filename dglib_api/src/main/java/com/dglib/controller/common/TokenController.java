package com.dglib.controller.common;

import java.util.Date;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.security.jwt.JwtException;
import com.dglib.security.jwt.JwtProvider;

@RestController
public class TokenController {
	
	@PostMapping("/api/member/refresh")
	public Map<String, Object> refresh(@RequestHeader("Authorization") String authHeader, String refreshToken){
		if(refreshToken == null) {
			throw new JwtException("NULL_REFRESH");
		}
		
		if(authHeader == null || authHeader.length() < 7) {
			throw new JwtException("INVALID_STRING");
		}
		
		
		String accessToken = authHeader.substring(7);
		
		if(checkExpiredToken(accessToken) == false ) {
		    return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
		}
		
		Map<String, Object> claims = JwtProvider.validateToken(refreshToken);
	
		String newAccessToken = JwtProvider.generateToken(claims, 10);
		String newRefreshToken = checkHourTime((Integer) claims.get("exp")) == true ? 
				JwtProvider.generateToken(claims, 60*24) : refreshToken;
		
		return Map.of("accessToken", newAccessToken, "refreshToken", newRefreshToken);
	}
	
	
	 private boolean checkExpiredToken(String token) {
		    try{
		    JwtProvider.validateToken(token);
		    } catch(Exception e) {
		        if(e.getMessage().equals("JWT_Expired")){
		        return true;
		        }
		    }
		    return false;
	 }
	 
	 private boolean checkHourTime(Integer exp) {
		    //JWT exp를 날짜로 변환
		    Date expDate = new Date( (long) exp * (1000));
		    //현재 시간과의 차이 계산 - 밀리세컨즈
		    long gap	= expDate.getTime() - System.currentTimeMillis();
		    //분단위 계산
		    long leftMin = gap / (1000 * 60);
		    //1시간 남았는지 체크
		    return leftMin < 60;
		    }

}
