package com.dglib.controller.notice;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.dto.notice.NoticeDetailDTO;
import com.dglib.dto.notice.NoticeListDTO;
import com.dglib.dto.notice.NoticeModDTO;
import com.dglib.dto.notice.NoticeSearchDTO;
import com.dglib.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
public class NoticeController {
	
	private final NoticeService noticeService;
	private final String DIRNAME = "notice";

	@PostMapping("/register")
	public ResponseEntity<String> regNotice(@ModelAttribute NoticeDTO noticeDTO, 
		 @RequestParam(required = false) List<MultipartFile> files){
		noticeService.register(noticeDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}
	
	@PutMapping("/{ano}")
	public ResponseEntity<String> updateNotice(@PathVariable Long ano, @ModelAttribute NoticeModDTO noticeModDTO,
		 @RequestParam(required = false) List<MultipartFile> files){
		noticeService.update(ano, noticeModDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/{ano}")
	public ResponseEntity<NoticeDetailDTO> getDetail(@PathVariable Long ano){
		return ResponseEntity.ok(noticeService.getDetail(ano));
	}
	
	@DeleteMapping("/{ano}")
	public ResponseEntity<NoticeDetailDTO> deleteNotice(@PathVariable Long ano){
		noticeService.delete(ano);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/list")
	public ResponseEntity<Page<NoticeListDTO>> listNotice(@ModelAttribute NoticeSearchDTO searchDTO){
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("postedAt");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
			    ? Sort.by(sortBy).ascending() 
			    : Sort.by(sortBy).descending();
		
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		return ResponseEntity.ok(noticeService.findAll(searchDTO, pageable));
	}
	
	@GetMapping("/listTop")
	public ResponseEntity<List<NoticeListDTO>> listTopNotice(@RequestParam int count){	
		return ResponseEntity.ok(noticeService.findTop(count));
	}
	
	@GetMapping("/listPinned")
	public ResponseEntity<List<NoticeListDTO>> listPinNotice(){
		return ResponseEntity.ok(noticeService.findPinned());
	}
	
}
