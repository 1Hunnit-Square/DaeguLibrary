package com.dglib.controller.mail;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.mail.MailDTO;
import com.dglib.service.mail.MailService;

import lombok.RequiredArgsConstructor;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail")
public class MailController {
	
	
	private final MailService mailService;
	
	
	
	@PostMapping("/sendtest") //백엔드 기준 허용된 아이피에서만 전송가능
	public ResponseEntity<String> sendTest(@RequestParam String email) {
		mailService.sendMail(email, "testtest", "<h1>hi?</h1>");
		return ResponseEntity.ok().build();
		
	}
	
	@GetMapping("/list")
    public ResponseEntity<List<MailDTO>> getMailList() {
        return ResponseEntity.ok(mailService.getMailList("RECIEVER","baek"));
    }
	
	@GetMapping("/{num}")
    public ResponseEntity<MailDTO> getMailDetail(@PathVariable int num) {
        return ResponseEntity.ok(mailService.getContent("RECIEVER","baek", num));
    }
	
	@DeleteMapping("/{num}")
    public ResponseEntity<String> delMail(@PathVariable int num) {
		mailService.deleteMail("RECIEVER","baek", num);
        return ResponseEntity.ok().build();
    }
	
	@GetMapping("/sendlist")
    public ResponseEntity<List<MailDTO>> getSendList() {
        return ResponseEntity.ok(mailService.getMailList("SENDER","test_admin"));
    }
	
	 @GetMapping("/view/{num}")
	    public ResponseEntity<Resource> viewFile(@PathVariable int num, @RequestParam int fileNum, @RequestParam String fileType){
	    return mailService.getFile("RECIEVER", "baek", num, fileNum, fileType);
	    }
}
