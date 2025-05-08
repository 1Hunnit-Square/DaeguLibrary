package com.dglib.security;

import java.io.UnsupportedEncodingException;
import java.util.Map;

import javax.crypto.SecretKey;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;

public class JwtProvider {

	private static String KEY = "We!@#Are!@#The!@#Awesome!@#Developers!@#Who!@#Conquered!@#The!@#World";
	
	public static String generateToken(Map<String, Object> valueMap, int min) {
	try {
		SecretKey secretKey =  Keys.hmacShaKeyFor(JwtProvider.KEY.getBytes("UTF-8"));
		
		
	} catch (Exception e) {

	}
	
	
		
		return null;
	}
}
