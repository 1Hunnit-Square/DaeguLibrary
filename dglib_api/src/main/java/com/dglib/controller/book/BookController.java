package com.dglib.controller.book;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.RentBookDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.service.book.BookService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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
		String path = "/bookreco/" + genre;
		return webClient.get()
				.uri(path).retrieve().bodyToMono(String.class).map(result -> {
					LOGGER.info("result: {}", result);
					Map<String, String> responseMap = new HashMap<>();
					responseMap.put("result", result);
					return ResponseEntity.ok(responseMap);
				}).onErrorResume(e -> {
					LOGGER.error("Python 백엔드 호출 중 오류 발생", e);
					Map<String, String> responseMap = new HashMap<>();
					responseMap.put("result", "백엔드 서버와 통신 중 오류가 발생했습니다.");
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap));
				});
	}
	@GetMapping("/search/{searchTerm}")
	public Mono<ResponseEntity<String>> searchBookApi(@PathVariable String searchTerm,
										@RequestParam(defaultValue = "1") int page,
										@RequestParam(defaultValue = "10") int itemsPerPage) {
		LOGGER.info("검색어: {}, 페이지: {}, 페이지당 항목 수: {}", searchTerm, page, itemsPerPage);
		return webClient.get()
				.uri(uriBuilder -> uriBuilder
                        .path("/search/{search_term}")
                        .queryParam("page", page)
                        .queryParam("items_per_page", itemsPerPage)
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
	public ResponseEntity<Page<BookSummaryDTO>> getNsLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    @RequestParam(required = false) String query,
	    @RequestParam(defaultValue = "전체") String option,
	    @RequestParam(required = false) List<String> previousQueries,
	    @RequestParam(defaultValue = "전체") List<String> previousOptions,
	    @RequestHeader(value = "Authorization", required = false) String mid 
	    ) {
		LOGGER.info("mid: {}", mid);
	    Pageable pageable = PageRequest.of(page - 1, size, Sort.by("libraryBookId").descending());
	    Page<BookSummaryDTO> bookList = bookService.getNsBookList(pageable, query, option, previousQueries, previousOptions, mid);	        
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/fslibrarybooklist")
	public ResponseEntity<Page<BookSummaryDTO>> getFsLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    LibraryBookFsDTO libraryBookFsDto,
	    @RequestHeader(value = "Authorization", required = false) String mid ) {
		LOGGER.info("mid: {}", mid);
		LOGGER.info("libraryBookFsDto: {}", libraryBookFsDto);
		libraryBookFsDto.processYearDates();
		Pageable pageable = PageRequest.of(page - 1, size );
		Page<BookSummaryDTO> bookList = bookService.getFsBookList(pageable, libraryBookFsDto, mid);
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/librarybookdetail/{librarybookid}")
	public ResponseEntity<BookDetailDTO> getLibraryBookDetail(@PathVariable("librarybookid") Long libraryBookId, @RequestHeader(value = "Authorization", required = false) String mid ) {
		LOGGER.info("librarybookid: {}", libraryBookId);
		LOGGER.info("mid: {}", mid);
		BookDetailDTO bookDetailDto = bookService.getLibraryBookDetail(libraryBookId, mid);
		return ResponseEntity.ok(bookDetailDto);
	}
	

	
	@PostMapping("/reservebook")
	public ResponseEntity<String> reserveBook(@RequestBody ReserveBookDTO reserveDto) {
		LOGGER.info("도서 예약 요청: {}", reserveDto);
		bookService.reserveBook(reserveDto.getLibraryBookId(), reserveDto.getMid());
		return ResponseEntity.ok().build();
	}
	


	
	
	
	
	
	
	
	

}
	
