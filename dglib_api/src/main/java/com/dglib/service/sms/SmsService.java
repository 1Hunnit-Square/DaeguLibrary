package com.dglib.service.sms;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.dglib.dto.sms.SmsReturnRequestDTO;
import com.dglib.dto.sms.SmsRequestDTO;
import com.dglib.util.EncryptUtil;
import com.google.gson.Gson;

import lombok.extern.log4j.Log4j2;

@Service @Log4j2
public class SmsService {
	private final String URL = "https://api.coolsms.co.kr/messages/v4/send-many/detail";
	private final String SMS_KEY = "CREATION";
	
	@Value("${sms.api.key}")
	private String apiKey;
	
	@Value("${sms.api.secret}")
	private String apiSecret;
	
	@Value("${sms.api.phoneNum}")
	private String senderNum;
	
	public void sendApi(SmsRequestDTO requestDTO) {
		if(!requestDTO.getSmsKey().equals(SMS_KEY)) {
			throw new RuntimeException("INVALID_AUTHCODE");
		}
		
		RestTemplate restTemplate = new RestTemplate();
		
		String dateTime = ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
		String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
		String signature = null;
		try {
			signature = EncryptUtil.sha256Encode(apiSecret, dateTime + salt, "HEX");
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
	        ResponseEntity<String> response = restTemplate.exchange(URL, HttpMethod.POST, entity, String.class);
	        
	        log.info(response);
	        
	        if(response.getStatusCode() != HttpStatus.OK){
	        	throw new RuntimeException("SMS API_ERROR");
	        }
	}
	
	public void sendReturnDueApi(SmsReturnRequestDTO dto) {
		
		RestTemplate restTemplate = new RestTemplate();
		
		String dateTime = ZonedDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
		String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
		String signature = null;
		try {
			signature = EncryptUtil.sha256Encode(apiSecret, dateTime + salt, "HEX");
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
	        for (Map.Entry<String, String> entry : dto.getPhoneMap().entrySet()) {
	            String phoneNum = entry.getKey();
	            String message = entry.getValue();
	            messageList.add(Map.of("to", phoneNum, "text", message, "from", senderNum));
	        }
	        Map<String, Object> smsMap = Map.of("messages", messageList);
	        Gson gson = new Gson();
	        String json = gson.toJson(smsMap);
	        
	        HttpEntity<String> entity = new HttpEntity<>(json, headers);
	        ResponseEntity<String> response = restTemplate.exchange(URL, HttpMethod.POST, entity, String.class);
	        
	        log.info(response);
	        
	        if(response.getStatusCode() != HttpStatus.OK){
	        	throw new RuntimeException("SMS API_ERROR");
	        }
	}
	
}
