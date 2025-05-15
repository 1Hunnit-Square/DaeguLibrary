package com.dglib.controller.admin;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.controller.book.BookController;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.service.book.BookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(BookController.class);
	private final BookService bookService;
	
	@PostMapping("/regbook")
	public ResponseEntity<String> regBook(@RequestBody BookRegistrationDTO bookRegistration) {
		LOGGER.info("도서 등록 요청: {}", bookRegistration);
		bookService.registerBook(bookRegistration);
		LOGGER.info("도서 등록 성공");
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/regbookcheck/{isbn}")
	public ResponseEntity<List<LibraryBookDTO>> regBookCheck(@PathVariable String isbn) {
		LOGGER.info("isbn: {}", isbn);
		List<LibraryBookDTO> libraryBookList = bookService.getLibraryBookList(isbn);
		return ResponseEntity.ok(libraryBookList);
	}
	
	@DeleteMapping("/deletelibrarybook/{libraryBookId}/{isbn}")
	public ResponseEntity<String> deleteLibraryBook(@PathVariable Long libraryBookId, @PathVariable String isbn) {
		LOGGER.info("도서 삭제 요청: {}", libraryBookId + ", " + isbn);
		bookService.deleteLibraryBook(libraryBookId, isbn);
		return ResponseEntity.ok().build();
	}

}
