package com.dglib.service.sms;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class AuthCodeService {
	private final ConcurrentHashMap<String, String> authCodes = new ConcurrentHashMap<>();
	
	public String saveAuthCode(String phoneNumber) {
		String code = generate6DigitCode();
        authCodes.put(phoneNumber, code);
        return code;
    }
	
	public boolean verifyAuthCode(String phoneNumber, String code) {
        String savedCode = authCodes.get(phoneNumber);
        if (savedCode != null && savedCode.equals(code)) {
            authCodes.remove(phoneNumber);  // 검증 성공하면 인증번호 삭제
            return true;
        }
        return false;
    }
	
	public static String generate6DigitCode() {
	        Random random = new Random();
	        int code = random.nextInt(1_000_000); // 0부터 999999까지
	        return String.format("%06d", code);   // 자릿수 맞춰서 앞에 0 추가
	    }
}
