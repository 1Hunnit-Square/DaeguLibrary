package com.dglib.controller.mail;

import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.mail.MailDTO;
import com.dglib.dto.mail.MailListDTO;
import com.dglib.dto.mail.MailSearchDTO;
import com.dglib.dto.mail.MailSendDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.mail.MailService;

import lombok.RequiredArgsConstructor;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail")
public class MailController {
	
	
	private final MailService mailService;
	
	
	
	@PostMapping("/sendMail") //백엔드 기준 허용된 아이피에서만 전송가능
	public ResponseEntity<String> sendMail(@ModelAttribute MailSendDTO sendDTO, @RequestParam(required = false) List<MultipartFile> files) {
		mailService.sendMail(sendDTO, files);
		return ResponseEntity.ok().build();
		
	}
	
	@GetMapping("/readMail/{eid}.gif")
	 public ResponseEntity<Resource> readMail(@PathVariable String eid) {
		mailService.readMail("SENDER", eid);
		
		byte[] gif = new byte[] {
			    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
			    0x01, 0x00, (byte)0x80, 0x00, 0x00, 0x00, 0x00,
			    0x00, (byte)0xFF, (byte)0xFF, (byte)0xFF, 0x21,
			    (byte)0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00,
			    0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
			    0x00, 0x00, 0x02, 0x02, (byte)0x44, 0x01, 0x00,
			    0x3B
			};
		
		 ByteArrayResource resource = new ByteArrayResource(gif);
        return ResponseEntity.ok()
        		.contentType(MediaType.IMAGE_GIF)
        		.header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentLength(gif.length)
                .body(resource);
    }
	
	@GetMapping("/list")
    public ResponseEntity<Page<MailListDTO>> getMailList(@ModelAttribute MailSearchDTO searchDTO) {
		String mid = JwtFilter.getMid();
        return ResponseEntity.ok(mailService.getMailList(searchDTO.getMailType(), mid, searchDTO));
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
	
	@PostMapping("/delList")
    public ResponseEntity<String> delMail(@RequestParam String mailType, @RequestParam List<String> eidList) {
		String mid = JwtFilter.getMid();
		mailService.deleteListMail(mailType, mid, eidList);
        return ResponseEntity.ok().build();
    }
	
	
	 @GetMapping("/view/{eid}")
	    public ResponseEntity<Resource> viewFile(@PathVariable String eid, @RequestParam int fileNum, @RequestParam String mailType){
	    return mailService.getFile(mailType, eid, fileNum);
	    }
}
