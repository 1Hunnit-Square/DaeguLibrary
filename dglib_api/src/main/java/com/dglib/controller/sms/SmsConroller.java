package com.dglib.controller.sms;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.sms.SmsRequestDTO;
import com.dglib.service.member.MemberService;
import com.dglib.service.sms.AuthCodeService;
import com.dglib.service.sms.SmsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sms")
public class SmsConroller {

	private final SmsService smsService;
	private final AuthCodeService authCodeService;
	private final MemberService memberService;

	
	@PostMapping("/sendTest")
	public ResponseEntity<String> sendSMS(@RequestBody SmsRequestDTO requestDTO) {
		smsService.sendApi(requestDTO);
		return ResponseEntity.ok().build();
		
	}
	
	@PostMapping("/sendCode")
	public ResponseEntity<String> sendCode(@RequestParam String phoneNum, @RequestParam String smsKey) {
		String code = authCodeService.saveAuthCode(phoneNum);
		String smsResult = "인증코드 : "+code;
		SmsRequestDTO requestDTO = new SmsRequestDTO(List.of(phoneNum), smsResult, smsKey);
		smsService.sendApi(requestDTO);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/checkCode")
	public ResponseEntity<Boolean> checkCode(@RequestParam String phoneNum, @RequestParam String authCode){
		Boolean authResult = authCodeService.verifyAuthCode(phoneNum, authCode);
		return ResponseEntity.ok(authResult);
	}
	
}
