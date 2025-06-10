package com.dglib.security.jwt;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;

import com.dglib.dto.member.MemberDTO;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;

public class JwtProvider {

	public static int accessExp = 10;
	
	public static int refreshExp = 60*24;
	
	private static String KEY = "We!@#Are!@#The!@#Awesome!@#Developers!@#Who!@#Conquered!@#The!@#World";
	
	public static String generateToken(Map<String, Object> claims, int min) {
		SecretKey secretKey = null;
	try {
		secretKey =  Keys.hmacShaKeyFor(JwtProvider.KEY.getBytes("UTF-8"));
		
	} catch (Exception e) {
		throw new RuntimeException(e.getMessage());
	}
	
	String jwtToken = Jwts.builder()
		    .setHeader(Map.of("typ","JWT"))
		    .setClaims(claims)
		    .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
		    .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
		    .signWith(secretKey)
		    .compact();
		
		return jwtToken;
	}
	
	public static Map<String, Object> validateToken(String token) {
		Map<String, Object> claims = null;
		try {
			SecretKey secretKey =  Keys.hmacShaKeyFor(JwtProvider.KEY.getBytes("UTF-8"));
			claims = Jwts.parserBuilder()
					.setSigningKey(secretKey)
					.build()
					.parseClaimsJws(token)
					.getBody();
			
		} catch(MalformedJwtException malformedJwtException){ 
	        throw new JwtException("JWT_MalFormed");
	    } catch(ExpiredJwtException expiredJwtException){ 
	        throw new JwtException("JWT_Expired");
	    } catch(InvalidClaimException invalidClaimException){ 
	        throw new JwtException("JWT_Invalid");
	    } catch(JwtException jwtException){
	        throw new JwtException("JWT_Error");
	    } catch(Exception e){
	    throw new JwtException("Error");
	    }
		
		
		return claims;
	}
	
	
	public static Map<String, Object> responseToken(MemberDTO memberDTO){
		Map<String, Object> claims = memberDTO.getClaims();
		
		String accessToken = JwtProvider.generateToken(claims, accessExp);
	    String refreshToken = JwtProvider.generateToken(claims, refreshExp);
	    
	    claims.put("accessToken", accessToken);
	    claims.put("refreshToken", refreshToken);
	    
	    return claims;
	}

	
}
