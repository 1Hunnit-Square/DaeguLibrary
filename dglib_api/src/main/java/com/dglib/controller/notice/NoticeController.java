package com.dglib.controller.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {
	
	private final NoticeService noticeService;
	
	@PostMapping("/register")
    public ResponseEntity<Long> register(@RequestBody NoticeDTO dto) {
        Long ano = noticeService.registerNotice(dto);
        return ResponseEntity.ok(ano);
    }
	
	@GetMapping("/{ano}")
	public ResponseEntity<NoticeDTO> get(@PathVariable Long ano){
		NoticeDTO dto = noticeService.get(ano);
		
		return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/list")
	public ResponseEntity<Page<NoticeDTO>> getList(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String keyword){
		
		Pageable pageable = PageRequest.of(page, size);
		Page<NoticeDTO> list = noticeService.getList(pageable, keyword);
		
		return ResponseEntity.ok(list);
	}
	
	@PutMapping("/{ano}")
	public ResponseEntity<Void> update(@PathVariable Long ano, @RequestBody NoticeDTO dto){
		noticeService.update(ano, dto);
		
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/{ano}")
	public ResponseEntity<Void> delete(@PathVariable Long ano){
		noticeService.delete(ano);
		
		return ResponseEntity.noContent().build();
	}
	
	

}
