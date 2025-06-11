package com.dglib.controller.gallery;

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

import com.dglib.dto.gallery.GalleryDTO;
import com.dglib.dto.gallery.GalleryDetailDTO;
import com.dglib.dto.gallery.GalleryListDTO;
import com.dglib.dto.gallery.GallerySearchDTO;
import com.dglib.dto.gallery.GalleryUpdateDTO;
import com.dglib.service.gallery.GalleryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gallery")
public class GalleryController {
	private final GalleryService galleryService;
	private final String DIRNAME = "gallery";

	@PostMapping("/register")
	public ResponseEntity<String> managerMember(@ModelAttribute GalleryDTO galleryDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		galleryService.register(galleryDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/{gno}")
	public ResponseEntity<GalleryDetailDTO> getDetail(@PathVariable Long gno) {
		return ResponseEntity.ok(galleryService.getDetail(gno));
	}

	@GetMapping("/list")
	public ResponseEntity<Page<GalleryListDTO>> manageMember(@ModelAttribute GallerySearchDTO searchDTO) {
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("postedAt");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		return ResponseEntity.ok(galleryService.findAll(searchDTO, pageable));
	}

	@PutMapping("/{gno}")
	public ResponseEntity<String> updateGallery(@PathVariable Long gno, 
			@ModelAttribute GalleryUpdateDTO galleryUpdateDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		System.out.println("지금 받은 데이터들-------------------------------" + galleryUpdateDTO);
		galleryService.update(gno, galleryUpdateDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{gno}")
	public ResponseEntity<GalleryDetailDTO> deleteGallery(@PathVariable Long gno) {
		galleryService.delete(gno);
		return ResponseEntity.noContent().build();
	}
}
