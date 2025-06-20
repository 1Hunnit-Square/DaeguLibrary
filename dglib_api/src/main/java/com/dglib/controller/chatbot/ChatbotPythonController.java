package com.dglib.controller.chatbot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.dto.book.ChatbotBookResponseDTO;
import com.dglib.dto.member.ChatMemberBorrowResposneDTO;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatbotpy")
public class ChatbotPythonController {
	

	private final Logger LOGGER = LoggerFactory.getLogger(ChatbotController.class);
	private final BookService bookService;
	private final MemberService memberService;
	

	@GetMapping("/booktitle/{book_title}")
	public ResponseEntity<ChatbotBookResponseDTO>  bookInfobyTitle(@PathVariable String book_title) {
		LOGGER.info(book_title);
		ChatbotBookResponseDTO dto = bookService.getBookInfoByBookTitle(book_title);
		return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/author/{author}")
	public ResponseEntity<ChatbotBookResponseDTO> bookInfobyAuthor(@PathVariable String author) {
        LOGGER.info(author);
        ChatbotBookResponseDTO dto = bookService.getBookInfoByAuthor(author);
        return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/memberborrow")
	public ResponseEntity<ChatMemberBorrowResposneDTO> memberBorrow(@RequestHeader("X-User-ID") String mid) {
		LOGGER.info("Member borrow request for mid: {}", mid);
		ChatMemberBorrowResposneDTO dto = memberService.getChatMemberBorrowState(mid);
		LOGGER.info("Member borrow response: {}", dto);
		return ResponseEntity.ok(dto);
		
	}
	
	@GetMapping("/borrowbest")
	public ResponseEntity<ChatbotBookResponseDTO> borrowBest() {
		LOGGER.info("Borrow best request");
		ChatbotBookResponseDTO dto = bookService.getBorrowBest();
		LOGGER.info("Borrow best response: {}", dto);
		return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/newbook")
	public ResponseEntity<ChatbotBookResponseDTO> newbook() {
		LOGGER.info("Borrow best request");
		ChatbotBookResponseDTO dto = bookService.getNewbook();
		LOGGER.info("Borrow best response: {}", dto);
		return ResponseEntity.ok(dto);
	}

}
