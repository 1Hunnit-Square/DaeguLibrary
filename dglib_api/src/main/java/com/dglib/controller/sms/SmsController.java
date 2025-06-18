package com.dglib.controller.sms;


import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.sms.SmsRequestDTO;
import com.dglib.dto.sms.SmsTemplateDTO;
import com.dglib.service.mail.MailService;
import com.dglib.service.member.MemberService;
import com.dglib.service.sms.AuthCodeService;
import com.dglib.service.sms.SmsService;
import com.dglib.service.sms.SmsTemplateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sms")
public class SmsController {

	private final SmsService smsService;
	private final SmsTemplateService smsTemplateService;
	private final AuthCodeService authCodeService;
	private final MemberService memberService;

	
	@PostMapping("/sendsms")
	public ResponseEntity<String> sendSMS(@ModelAttribute SmsRequestDTO requestDTO) {
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
	
	@PostMapping("/regTemplate")
	public ResponseEntity<Long> regTemplate(@RequestParam String content) {
		return ResponseEntity.ok(smsTemplateService.regTemplate(content));
		
	}
	
	@GetMapping("/getTemplate")
	public ResponseEntity<Page<SmsTemplateDTO>> getTemplate(@RequestParam int page, @RequestParam int size) {
		Sort sort = Sort.by("templateId").descending();
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		return ResponseEntity.ok(smsTemplateService.getTemplate(pageable));
		
	}
	
	@GetMapping("/findTemplate")
	public ResponseEntity<String> findTemplate(@RequestParam Long id) {
		return ResponseEntity.ok(smsTemplateService.findTemplate(id));
		
	}
	
	@PostMapping("/delTemplate")
	public ResponseEntity<String> delTemplate(@RequestParam Long id) {
		smsTemplateService.delTemplate(id);
		return ResponseEntity.ok().build();
		
	}
	
	
}
