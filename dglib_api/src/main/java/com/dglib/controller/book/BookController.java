package com.dglib.controller.book;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.dto.book.BookDTO;
import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookNewSumDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.BookTopSumDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.NewLibrarayBookRequestDTO;
import com.dglib.dto.book.RentBookDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.book.SearchBookDTO;
import com.dglib.dto.member.MemberDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.security.jwt.JwtProvider;
import com.dglib.service.book.BookService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book")
public class BookController {

	private final WebClient webClient;
	private final Logger LOGGER = LoggerFactory.getLogger(BookController.class);
	private final BookService bookService;
	
	@GetMapping("/bookreco/{genre}")
	public Mono<ResponseEntity<Map<String, String>>> bookReco(@PathVariable String genre) {
	    LOGGER.info("genre: {}", genre);

	    return webClient.get()
	            .uri(uriBuilder -> uriBuilder
	                    .path("/bookreco/{genre}")
	                    .build(genre))
	            .retrieve()
	            .bodyToMono(String.class)
	            .map(result -> {
	                LOGGER.info("result: {}", result);
	                Map<String, String> responseMap = new HashMap<>();
	                responseMap.put("result", result);
	                return ResponseEntity.ok(responseMap);
	            })
	            .onErrorResume(e -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", e);
	                Map<String, String> responseMap = new HashMap<>();
	                responseMap.put("result", "백엔드 서버와 통신 중 오류가 발생했습니다.");
	                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap));
	            });
	}
	
	@GetMapping("/bookrecolist/{genre}")
	public Mono<ResponseEntity<String>> bookrecoList(
	        @PathVariable String genre,
	        @RequestParam(defaultValue = "1") int page,
	        @RequestParam(defaultValue = "10") int size) {
	    LOGGER.info("genre: {}", genre);

	    return webClient.get()
	            .uri(uriBuilder -> uriBuilder
	                    .path("/bookrecolist/{genre}")
	                    .queryParam("page", page)
	                    .queryParam("size", size)
	                    .build(genre))
	            .retrieve()
	            .bodyToMono(String.class)
	            .map(result -> {
	                LOGGER.info("result: {}", result);
	                return ResponseEntity.ok(result);
	            })
	            .onErrorResume(e -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", e);
	                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                        .body("백엔드 서버와 통신 중 오류가 발생했습니다."));
	            });
	}
	@GetMapping("/search/{searchTerm}")
	public Mono<ResponseEntity<String>> searchBookApi(@PathVariable String searchTerm,
										@RequestParam(defaultValue = "1") int page,
										@RequestParam(defaultValue = "10") int size) {
		LOGGER.info("검색어: {}, 페이지: {}, 페이지당 항목 수: {}", searchTerm, page, size);
		return webClient.get()
				.uri(uriBuilder -> uriBuilder
                        .path("/search/{search_term}")
                        .queryParam("page", page)
                        .queryParam("items_per_page", size)
                        .build(searchTerm))
				.retrieve()
				.bodyToMono(String.class)
				.map(body -> {
					return ResponseEntity.ok(body);
				})
				.onErrorResume(e -> {
                    LOGGER.error("Python 백엔드 호출 중 오류 발생", e);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("백엔드 서버와 통신 중 오류가 발생했습니다."));
                });
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
		String mid = JwtProvider.getMid();
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
	    HttpSession session,
	    LibraryBookFsDTO libraryBookFsDto) {
		String mid = JwtProvider.getMid();
		String sessionId = session.getId();
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
		        bookService.recordSearch(word, sessionId);
		    }
		}
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/newlibrarybooklist")
	public ResponseEntity<Page<BookNewSumDTO>> getNewLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    NewLibrarayBookRequestDTO newLibrarayBookRequestDto) {
		String mid = JwtProvider.getMid();
		LOGGER.info("mid: {}", mid);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("libraryBookId").descending() );
		Page<BookNewSumDTO> bookList = bookService.getNewBookList(pageable, newLibrarayBookRequestDto);
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/librarybookdetail/{librarybookid}")
	public ResponseEntity<BookDetailDTO> getLibraryBookDetail(@PathVariable("librarybookid") Long libraryBookId) {
		String mid = JwtProvider.getMid();
		LOGGER.info("librarybookid: {}", libraryBookId);
		LOGGER.info("mid: {}", mid);
		BookDetailDTO bookDetailDto = bookService.getLibraryBookDetail(libraryBookId, mid, null);
		return ResponseEntity.ok(bookDetailDto);
	}
	
	@GetMapping("/recoLibraryBookDetail/{isbn}")
	public ResponseEntity<BookDetailDTO> getRecoLibraryBookDetail(@PathVariable("isbn") String isbn) {
		LOGGER.info("isbn: {}", isbn);
		String mid = JwtProvider.getMid();
		BookDetailDTO bookDetailDto = bookService.getLibraryBookDetail(null , mid, isbn);
		return ResponseEntity.ok(bookDetailDto);
	}
	
	@GetMapping("/topborrowedbooklist")
	public ResponseEntity<Page<BookTopSumDTO>> getTopBorrowedBookList(@RequestParam(defaultValue = "1") int page, 
		    @RequestParam(defaultValue = "10") int size,
		    @RequestParam(defaultValue = "오늘") String check) {
		String mid = JwtProvider.getMid();
		LOGGER.info("대출베스트 도서 요청 " + check);
		LOGGER.info("mid: {}", mid);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("borrowCount").descending());
		Page<BookTopSumDTO> bookList = bookService.getTopBorrowedBookList(pageable, check);
		return ResponseEntity.ok(bookList);
		
	}
	

	

	
	
	


	
	
	
	
	
	
	
	

}
	
