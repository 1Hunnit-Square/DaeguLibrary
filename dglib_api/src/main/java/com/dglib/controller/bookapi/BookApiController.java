package com.dglib.controller.bookapi;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.dto.member.MemberRecoBookDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/bookapi")
public class BookApiController {
	
	private final WebClient webClient;
	private final Logger LOGGER = LoggerFactory.getLogger(BookApiController.class);
	private final BookService bookService;
	private final MemberService memberService;
	
	public BookApiController(@Qualifier("webClient") WebClient webClient, BookService bookService, MemberService memberService) {
        this.webClient = webClient;
        this.bookService = bookService;
        this.memberService = memberService;
    }
	
	
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
	            .onErrorMap(original -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
	                return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
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
	            .onErrorMap(original -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
	                return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
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
				.onErrorMap(original -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
	                return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
	            });
	}
	
	@GetMapping("/wordcloud")
	public Mono<ResponseEntity<String>> wordCloud() {
		String mid = JwtFilter.getMid();
		List<String> isbns = memberService.getMemberBorrowedBookIsbns(mid);
		return webClient.post().uri("/wordcloud")
				.contentType(MediaType.APPLICATION_JSON)
				.bodyValue(isbns)
				.retrieve()
				.bodyToMono(String.class).map(body -> {
			LOGGER.info("워드클라우드 응답: {}", body);
			return ResponseEntity.ok(body);
		}).onErrorMap(original -> {
			LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
			return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
		});
	
	}
	
	@GetMapping("/memberrecobook")
	public Mono<ResponseEntity<String>> memberRecoBook() {
	    String mid = JwtFilter.getMid();
	    MemberRecoBookDTO dto = memberService.getMemberBorrowedBookIsbnForReco(mid);
	    LOGGER.info("회원 추천 도서 요청, mid: {}", mid);
	    return webClient.post() 
	            .uri("/memberrecobook") 
	            .bodyValue(dto) 
	            .retrieve()
	            .bodyToMono(String.class)
	            .map(body -> {
	                LOGGER.info("회원 추천 도서 응답: {}", body);
	                return ResponseEntity.ok(body);
	            })
	            .onErrorMap(original -> {
	                LOGGER.error("Python 백엔드 호출 중 오류 발생", original);
	                return new RuntimeException("api 서버와 통신 중 오류가 발생했습니다.", original);
	            });
	
	}
	
	
	
	
	
	

}
