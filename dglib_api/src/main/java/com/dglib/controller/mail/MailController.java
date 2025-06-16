package com.dglib.controller.mail;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.service.mail.MailService;

import lombok.RequiredArgsConstructor;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail")
public class MailController {
	
	
	private final MailService mailService;
	
	
	
	@PostMapping("/mailTest") //백엔드 기준 허용된 아이피에서만 전송가능
	public ResponseEntity<String> mailTest(@RequestParam String email) {
		mailService.sendMail(email, "메일 테스트", "안녕하세요?");
		return ResponseEntity.ok().build();
		
	}
}
