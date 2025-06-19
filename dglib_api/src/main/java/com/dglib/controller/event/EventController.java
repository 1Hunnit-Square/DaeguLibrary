package com.dglib.controller.event;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
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

import com.dglib.controller.program.ProgramController;
import com.dglib.dto.event.EventBannerDTO;
import com.dglib.dto.event.EventDTO;
import com.dglib.dto.event.EventDetailDTO;
import com.dglib.dto.event.EventListDTO;
import com.dglib.dto.event.EventSearchDTO;
import com.dglib.dto.event.EventUpdateDTO;
import com.dglib.service.event.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/event")
public class EventController {
	private static final Logger log = LoggerFactory.getLogger(ProgramController.class);
	private final EventService eventService;
	private final String DIRNAME = "event";
	
	@Value("${file.upload.path}")
	private String uploadPath;

	@PostMapping("/register")
	public ResponseEntity<String> manageMember(@ModelAttribute EventDTO eventDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		eventService.register(eventDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/detail/{eno}")
	public ResponseEntity<EventDetailDTO> getDetail(@PathVariable Long eno) {
		return ResponseEntity.ok(eventService.getDetail(eno));
	}

	@GetMapping("/list")
	public ResponseEntity<Page<EventListDTO>> manageMember(@ModelAttribute EventSearchDTO searchDTO) {
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("postedAt");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		return ResponseEntity.ok(eventService.findAll(searchDTO, pageable));
	}

	@PutMapping("/update/{eno}")
	public ResponseEntity<String> updateEvent(@PathVariable Long eno, @ModelAttribute EventUpdateDTO eventUpdateDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		System.out.println("지금 받은 데이터들" + eventUpdateDTO);
		eventService.update(eno, eventUpdateDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/delete/{eno}")
	public ResponseEntity<EventDetailDTO> deleteEvent(@PathVariable Long eno) {
		eventService.delete(eno);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/listTop")
	public ResponseEntity<List<EventListDTO>> listTopEvent(@RequestParam int count) {
		return ResponseEntity.ok(eventService.findTop(count));
	}

	@GetMapping("/listPinned")
	public ResponseEntity<List<EventListDTO>> listPinEvent() {
		return ResponseEntity.ok(eventService.findPinned());
	}

	// -------------------------- 배너 --------------------------
	// 배너 목록 조회
	@GetMapping("/banner")
	public ResponseEntity<List<EventBannerDTO>> getBannerList() {
		return ResponseEntity.ok(eventService.getBannerList());
	}

	// 배너 등록
	@PostMapping("/banner/register")
	public ResponseEntity<Long> registerBanner(@RequestParam Long eventNo, @RequestParam MultipartFile file) {
		Long bannerId = eventService.registerBanner(eventNo, file);
		return ResponseEntity.ok(bannerId);
	}

	// 배너 삭제
	@DeleteMapping("/banner/{bno}")
	public ResponseEntity<Void> deleteBanner(@PathVariable Long bno) {
		eventService.deleteBanner(bno);
		return ResponseEntity.noContent().build();
	}

	// 배너 이미지 조회
	@GetMapping("/banner/view")
	public ResponseEntity<Resource> viewEventBannerImage(@RequestParam String filePath) {
		if (filePath == null || filePath.isBlank()) {
			return ResponseEntity.badRequest().build();
		}

		try {
			Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
			Path fullPath = basePath.resolve(filePath).normalize();

			if (!Files.exists(fullPath)) {
				return ResponseEntity.notFound().build();
			}

			Resource resource = new UrlResource(fullPath.toUri());
			String contentType = Files.probeContentType(fullPath);

			return ResponseEntity.ok()
					.contentType(
							MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
					.body(resource);
		} catch (IOException e) {
			log.error("이벤트 배너 이미지 조회 중 오류", e);
			return ResponseEntity.internalServerError().build();
		}
	}

}
