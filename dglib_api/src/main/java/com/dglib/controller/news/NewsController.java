package com.dglib.controller.news;

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

import com.dglib.dto.news.NewsDTO;
import com.dglib.dto.news.NewsDetailDTO;
import com.dglib.dto.news.NewsListDTO;
import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.dto.news.NewsUpdateDTO;
import com.dglib.service.news.NewsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/news")
public class NewsController {
	private final NewsService newsService;
	private final String DIRNAME = "news";

	@PostMapping("/register")
	public ResponseEntity<String> manageMember(@ModelAttribute NewsDTO newsDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		newsService.register(newsDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/{nno}")
	public ResponseEntity<NewsDetailDTO> getDetail(@PathVariable Long nno) {
		return ResponseEntity.ok(newsService.getDetail(nno));
	}

	@GetMapping("/list")
	public ResponseEntity<Page<NewsListDTO>> manageMember(@ModelAttribute NewsSearchDTO searchDTO) {
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("postedAt");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		return ResponseEntity.ok(newsService.findAll(searchDTO, pageable));
	}

	@PutMapping("/{nno}")
	public ResponseEntity<String> updateNews(@PathVariable Long nno, @ModelAttribute NewsUpdateDTO newsUpdateDTO,
			@RequestParam(required = false) List<MultipartFile> files) {
		System.out.println("지금 받은 데이터들" + newsUpdateDTO);
		newsService.update(nno, newsUpdateDTO, files, DIRNAME);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{nno}")
	public ResponseEntity<NewsDetailDTO> deleteNews(@PathVariable Long nno) {
		newsService.delete(nno);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/listTop")
	public ResponseEntity<List<NewsListDTO>> listTopNews(@RequestParam int count){	
		return ResponseEntity.ok(newsService.findTop(count));
	}
	
	@GetMapping("/listPinned")
	public ResponseEntity<List<NewsListDTO>> listPinNews(){
		return ResponseEntity.ok(newsService.findPinned());
	}
}
