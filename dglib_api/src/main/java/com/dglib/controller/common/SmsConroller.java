package com.dglib.controller.common;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.dglib.dto.common.SmsRequestDTO;
import com.google.gson.Gson;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;

@RestController @PropertySource("classpath:app-secret.properties")
public class SmsConroller {

	@Value("${sms.api.key}")
	private String apiKey;
	
	@Value("${sms.api.secret}")
	private String apiSecret;
	
	@Value("${sms.api.phoneNum}")
	private String senderNum;
	
	@PostMapping("/api/member/sms")
	public ResponseEntity<String> sendSMS(@RequestBody SmsRequestDTO requestDTO) {
		if(!requestDTO.getAuthCode().equals("CREATION")) {
			throw new RuntimeException("INVALID_AUTHCODE");
		}
		String url = "https://api.coolsms.co.kr/messages/v4/send-many/detail";
		RestTemplate restTemplate = new RestTemplate();
		
		String dateTime = ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
		String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
		String signature = null;
		try {
			signature = sha256Encode(apiSecret, dateTime + salt);
		} catch (Exception e) {
			throw new RuntimeException("ENCODE_ERROR");
		}
			String authHeader = String.format(
		            "HMAC-SHA256 apiKey=%s, date=%s, salt=%s, signature=%s",
		            apiKey, dateTime, salt, signature
		        );
			
			HttpHeaders headers = new HttpHeaders();
	        headers.set("Authorization", authHeader);
	        headers.setContentType(MediaType.APPLICATION_JSON);
			
	        List<Map<String,String>> messageList = new ArrayList<>();
	        for(String phoneNum : requestDTO.getPhoneList()) {
	        messageList.add(Map.of("to",phoneNum,"text", requestDTO.getMessage(),"from", senderNum));
	        }
	        Map<String, Object> smsMap = Map.of("messages", messageList);
	        Gson gson = new Gson();
	        String json = gson.toJson(smsMap);
	        
	        HttpEntity<String> entity = new HttpEntity<>(json, headers);
	        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
	        return response;
	}
	
	
	public String sha256Encode (String apiSecret, String value) throws NoSuchAlgorithmException, InvalidKeyException, WeakKeyException, UnsupportedEncodingException {
			String result = null;

			SecretKey secretKey = Keys.hmacShaKeyFor(apiSecret.getBytes("UTF-8"));
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(secretKey);
			byte[] hmac = mac.doFinal(value.getBytes("UTF-8"));
			result = bytesToHex(hmac);
			
		
		return result;
	}
	
	private String bytesToHex(byte[] bytes) {
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
