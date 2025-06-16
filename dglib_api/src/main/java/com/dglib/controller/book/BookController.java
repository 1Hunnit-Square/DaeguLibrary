package com.dglib.controller.book;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookNewSumDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.BookTopNewResponseDTO;
import com.dglib.dto.book.BookTopSumDTO;
import com.dglib.dto.book.EbookListRequestDTO;
import com.dglib.dto.book.EbookSumDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.NewLibrarayBookRequestDTO;
import com.dglib.dto.book.SearchBookDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.book.BookService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;



@RestController
@RequestMapping("/api/book")
public class BookController {

	private final WebClient webClient;
	private final Logger LOGGER = LoggerFactory.getLogger(BookController.class);
	private final BookService bookService;
	
	public BookController(@Qualifier("webClient") WebClient webClient, BookService bookService) {
        this.webClient = webClient;
        this.bookService = bookService;
    }
		
	
	@GetMapping("/nslibrarybooklist")
	public ResponseEntity<SearchBookDTO> getNsLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    @RequestParam(required = false) String query,
	    @RequestParam(defaultValue = "전체") String option,
	    @RequestParam(required = false) List<String> previousQueries,
	    @RequestParam(defaultValue = "전체") List<String> previousOptions,
	    @RequestParam String fingerprint
	    ) {
		String mid = JwtFilter.getMid();
		LOGGER.info("mid: " + mid);
		LOGGER.info("fingerPrint: " + fingerprint);
	    Pageable pageable = PageRequest.of(page - 1, size, Sort.by("libraryBookId").descending());
	    SearchBookDTO bookList = bookService.getNsBookList(pageable, query, option, previousQueries, previousOptions, mid);
	    if (StringUtils.hasText(query)) {
			LOGGER.info("검색어: {}", query);
			bookService.recordSearch(query, fingerprint);
		}
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/fslibrarybooklist")
	public ResponseEntity<Page<BookSummaryDTO>> getFsLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    LibraryBookFsDTO libraryBookFsDto) {
		String mid = JwtFilter.getMid();
		LOGGER.info(libraryBookFsDto.toString());
		libraryBookFsDto.processYearDates();
		Pageable pageable = PageRequest.of(page - 1, size );
		Page<BookSummaryDTO> bookList = bookService.getFsBookList(pageable, libraryBookFsDto, mid);
		for (String word : Arrays.asList(
		        libraryBookFsDto.getTitle(),
		        libraryBookFsDto.getAuthor(),
		        libraryBookFsDto.getPublisher(),
		        libraryBookFsDto.getKeyword())) {
		    if (StringUtils.hasText(word)) {
		        bookService.recordSearch(word, libraryBookFsDto.getFingerprint());
		    }
		}
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/newlibrarybooklist")
	public ResponseEntity<Page<BookNewSumDTO>> getNewLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    NewLibrarayBookRequestDTO newLibrarayBookRequestDto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("mid: {}", mid);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("libraryBookId").descending() );
		Page<BookNewSumDTO> bookList = bookService.getNewBookList(pageable, newLibrarayBookRequestDto);
	    return ResponseEntity.ok(bookList);
	}
	
	
	@GetMapping("/librarybookdetail/{isbn}")
	public ResponseEntity<BookDetailDTO> getRecoLibraryBookDetail(@PathVariable("isbn") String isbn) {
		LOGGER.info("isbn: {}", isbn);
		String mid = JwtFilter.getMid();
		BookDetailDTO bookDetailDto = bookService.getLibraryBookDetail(mid, isbn);
		return ResponseEntity.ok(bookDetailDto);
	}
	
	@GetMapping("/topborrowedbooklist")
	public ResponseEntity<Page<BookTopSumDTO>> getTopBorrowedBookList(@RequestParam(defaultValue = "1") int page, 
		    @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "오늘") String check) {
		String mid = JwtFilter.getMid();
		LOGGER.info("대출베스트 도서 요청 " + check);
		LOGGER.info("mid: {}", mid);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("borrowCount").descending());
		Page<BookTopSumDTO> bookList = bookService.getTopBorrowedBookList(pageable, check);
		return ResponseEntity.ok(bookList);
		
	}
	
	@GetMapping("/ebooklist")
	public ResponseEntity<Page<EbookSumDTO>> getEbookList(EbookListRequestDTO dto) {
		LOGGER.info("전자책 목록 요청: {}", dto);
		Page<EbookSumDTO> ebookList = bookService.getEbookList(dto);
		return ResponseEntity.ok(ebookList);
		
	}
	
	@GetMapping("/topnew/{type}")
	public ResponseEntity<List<BookTopNewResponseDTO>> getTopNewBookList(@PathVariable String type) {
		LOGGER.info("대출베스트 신간 도서 요청: {}", type);
		List<BookTopNewResponseDTO> bookList = bookService.getTopNewBookList(type);
		return ResponseEntity.ok(bookList);
	}
	

	

	
	
	


	
	
	
	
	
	
	
	

}
	
