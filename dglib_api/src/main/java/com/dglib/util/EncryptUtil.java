package com.dglib.util;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.SecretKey;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;

public class EncryptUtil {
	
	public static String sha256Encode (String apiSecret, String value, String type) throws NoSuchAlgorithmException, InvalidKeyException, WeakKeyException, UnsupportedEncodingException {
		String result = null;

		SecretKey secretKey = Keys.hmacShaKeyFor(apiSecret.getBytes("UTF-8"));
		Mac mac = Mac.getInstance("HmacSHA256");
		mac.init(secretKey);
		byte[] hmac = mac.doFinal(value.getBytes("UTF-8"));
		
		if(type.equals("HEX"))
		result = bytesToHex(hmac);
		else if(type.equals("BASE64"))
		result = Base64.getEncoder().encodeToString(hmac);
		else
		throw new RuntimeException("ENCODE_TYPE_ERROR");
		
	return result;
}
	
	private static String bytesToHex(byte[] bytes) {
	    StringBuilder hexString = new StringBuilder(2 * bytes.length);
	    for (byte b : bytes) {
	        String hex = Integer.toHexString(0xff & b);
	        if (hex.length() == 1) {
	            hexString.append('0');
	        }
	        hexString.append(hex);
	    }
	    return hexString.toString();
	}
}
