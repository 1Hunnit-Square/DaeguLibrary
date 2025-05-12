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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.dto.book.BookDTO;
import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookDTO;
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
	
	@PostMapping("/regbook")
	public ResponseEntity<String> regBook(@RequestBody BookRegistrationDTO bookRegistration) {
		bookService.registerBook(bookRegistration);
		LOGGER.info("도서 등록 성공");
		
	    
		return ResponseEntity.ok("도서가 성공적으로 등록되었습니다.");
	}
	
	@GetMapping("/librarybooklist")
	public ResponseEntity<Page<BookSummaryDTO>> getLibraryBookList(
	    @RequestParam(defaultValue = "1") int page, 
	    @RequestParam(defaultValue = "10") int size,
	    @RequestParam(required = false) String query,
	    @RequestParam(defaultValue = "전체") String option,
	    @RequestParam(required = false) List<String> previousQueries,
	    @RequestParam(defaultValue = "전체") List<String> previousOptions
	    ) {
	    
	    Pageable pageable = PageRequest.of(page - 1, size);
	    Page<BookSummaryDTO> bookList = bookService.getBookList(pageable, query, option, previousQueries, previousOptions);	        
	    return ResponseEntity.ok(bookList);
	}
	
	@GetMapping("/librarybookdetail/{librarybookid}")
	public ResponseEntity<BookDetailDTO> getLibraryBookDetail(@PathVariable("librarybookid") Long libraryBookId) {
		LOGGER.info("librarybookid: {}", libraryBookId);
		BookDetailDTO bookDetailDto = bookService.getLibraryBookDetail(libraryBookId);

		return ResponseEntity.ok(bookDetailDto);
	}
	
	@GetMapping("/rentallist")
	public ResponseEntity<Page<RentalBookListDTO>> getRentalList(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		LOGGER.info(page + " ");
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("rentId").descending());
		Page<RentalBookListDTO> rentalList = bookService.getRentalList(pageable);
		LOGGER.info("rentalList: {}", rentalList);
		return ResponseEntity.ok(rentalList);
	}
	
	@PostMapping("/reservebook")
	public ResponseEntity<String> reserveBook(@RequestBody ReserveBookDTO reserveDto) {
		bookService.reserveBook(reserveDto.getLibraryBookId(), reserveDto.getMid());
		return ResponseEntity.ok("도서 예약이 완료되었습니다.");
	}
	
	@GetMapping("/reservebooklist")
	public ResponseEntity<Page<ReserveBookListDTO>> reserveBookList(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("reserveDate").descending());
		Page<ReserveBookListDTO> reserveList = bookService.getReserveList(pageable);
		LOGGER.info("reserveList: {}", reserveList);
		return ResponseEntity.ok(reserveList);
	}
	
	@PostMapping("/cancelreservebook")
	public ResponseEntity<String> cancelReserveBook(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
        LOGGER.info("도서 예약 취소 요청: {}", reserveStateChangeDtos);
        bookService.cancelReserveBook(reserveStateChangeDtos);
        return ResponseEntity.ok("도서 예약이 취소되었습니다.");
	}
	
	@PostMapping("/rereservebook")
	public ResponseEntity<String> reReserveBook(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
		LOGGER.info("도서 재예약 요청: {}", reserveStateChangeDtos);
		bookService.reReserveBook(reserveStateChangeDtos);
		return ResponseEntity.ok("도서 예약이 완료되었습니다.");
	}
	
	@PostMapping("/completeborrowing")
	public ResponseEntity<String> completeBorrowing(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
		LOGGER.info("도서 대출 완료 요청: {}", reserveStateChangeDtos);
		bookService.completeBorrowing(reserveStateChangeDtos);
		return ResponseEntity.ok("도서 대출이 완료되었습니다.");
	}
	@PostMapping("/returnbook")
	public ResponseEntity<String> returnBook(@RequestBody List<RentalStateChangeDTO> rentalStateChangeDto) {
        LOGGER.info("도서 반납 요청: {}", rentalStateChangeDto);
        bookService.completeBookReturn(rentalStateChangeDto);
        return ResponseEntity.ok("도서 반납이 완료되었습니다.");
	}
	
	@GetMapping("searchlibrarybook/{libraryBookId}")
	public ResponseEntity<Page<LibraryBookSearchByBookIdDTO>> searchMemberNumber(@PathVariable Long libraryBookId, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size){
		LOGGER.info("libraryBookId: {}", libraryBookId);
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<LibraryBookSearchByBookIdDTO> memberList = bookService.searchByLibraryBookBookId(libraryBookId, pageable);


		return ResponseEntity.ok(memberList);
		
	}
	
	@PostMapping("rentbook")
	public ResponseEntity<String> rentBook(@RequestBody RentBookDTO rentBookDto) {
		LOGGER.info("도서 대출 요청: {}", rentBookDto);
		bookService.rentBook(rentBookDto.getLibraryBookId(), rentBookDto.getMno());
		return ResponseEntity.ok("도서 대출이 완료되었습니다.");
	}

}
	
