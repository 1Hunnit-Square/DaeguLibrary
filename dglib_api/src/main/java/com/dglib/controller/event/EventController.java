package com.dglib.controller.event;

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
	private final EventService eventService;
	private final String DIRNAME = "event";

	@PostMapping("/register")
	public ResponseEntity<String> manageMember(@ModelAttribute EventDTO eventDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		eventService.register(eventDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/{eno}")
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

	@PutMapping("/{eno}")
	public ResponseEntity<String> updateEvent(@PathVariable Long eno, @ModelAttribute EventUpdateDTO eventUpdateDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		System.out.println("지금 받은 데이터들" + eventUpdateDTO);
		eventService.update(eno, eventUpdateDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{eno}")
	public ResponseEntity<EventDetailDTO> deleteEvent(@PathVariable Long eno) {
		eventService.delete(eno);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/listTop")
	public ResponseEntity<List<EventListDTO>> listTopEvent(@RequestParam int count){	
		return ResponseEntity.ok(eventService.findTop(count));
	}
	
	@GetMapping("/listPinned")
	public ResponseEntity<List<EventListDTO>> listPinEvent(){
		return ResponseEntity.ok(eventService.findPinned());
	}
}
