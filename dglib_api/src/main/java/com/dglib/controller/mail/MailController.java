package com.dglib.controller.mail;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.mail.MailDTO;
import com.dglib.dto.mail.MailListDTO;
import com.dglib.dto.mail.MailSearchDTO;
import com.dglib.security.jwt.JwtFilter;
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
    public ResponseEntity<Page<MailListDTO>> getMailList(@ModelAttribute MailSearchDTO searchDTO) {
		String mid = JwtFilter.getMid();
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
        return ResponseEntity.ok(mailService.getMailList(searchDTO.getMailType(), mid ,page - 1, size));
    }
	
	@GetMapping("/{eid}")
    public ResponseEntity<MailDTO> getMailDetail(@PathVariable String eid, @RequestParam String mailType) {
		String mid = JwtFilter.getMid();
        return ResponseEntity.ok(mailService.getContent(mailType,mid, eid));
    }
	
	@DeleteMapping("/{eid}")
    public ResponseEntity<String> delMail(@PathVariable String eid, @RequestParam String mailType) {
		String mid = JwtFilter.getMid();
		mailService.deleteMail(mailType, mid, eid);
        return ResponseEntity.ok().build();
    }
	
	
	 @GetMapping("/view/{eid}")
	    public ResponseEntity<Resource> viewFile(@PathVariable String eid, @RequestParam int fileNum, @RequestParam String fileType, 
	    		@RequestParam String mailType){
	    return mailService.getFile(mailType, eid, fileNum, fileType);
	    }
}
