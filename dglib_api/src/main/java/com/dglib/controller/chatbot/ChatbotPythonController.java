package com.dglib.controller.chatbot;

import java.time.LocalDate;
import java.util.List;

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
import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.member.ChatMemberBorrowResponseDTO;
import com.dglib.dto.member.ChatMemberReservationBookDTO;
import com.dglib.dto.member.ChatMemberReservationResponseDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.service.book.BookService;
import com.dglib.service.days.ClosedDayService;
import com.dglib.service.member.MemberService;
import com.dglib.service.program.ProgramService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatbotpy")
public class ChatbotPythonController {
	

	private final Logger LOGGER = LoggerFactory.getLogger(ChatbotController.class);
	private final BookService bookService;
	private final MemberService memberService;
	private final ClosedDayService closedDayService;
	private final ProgramService programService;
	

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
	public ResponseEntity<ChatMemberBorrowResponseDTO> memberBorrow(@RequestHeader("X-User-ID") String mid) {
		LOGGER.info("Member borrow request for mid: {}", mid);
		ChatMemberBorrowResponseDTO dto = memberService.getChatMemberBorrowState(mid);
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
	
	@GetMapping("/monthholiday/{year}/{month}")
	public ResponseEntity<List<ClosedDayDTO>> monthHoliday(@PathVariable int year, @PathVariable int month) {
		LOGGER.info("Month holiday request for month: {}", month);
		
		List<ClosedDayDTO> response = closedDayService.getMonthlyList(year, month);
		LOGGER.info("Month holiday response: {}", response);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/monthholiday/{date}")
	public ResponseEntity<ClosedDayDTO> holidayByDate(@PathVariable String date) {
		LOGGER.info("Month holiday request for date: {}", date);

		LocalDate localDate = LocalDate.parse(date);
		ClosedDayDTO response = closedDayService.getByChat(localDate);
		LOGGER.info("Month holiday response: {}", response);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/weekholiday/{start_str}/{end_str}")
	public ResponseEntity<List<ClosedDayDTO>> monthHolidayRange(@PathVariable String start_str,
			@PathVariable String end_str) {
		LOGGER.info("Month holiday range request from {} to {}", start_str, end_str);

		LocalDate start = LocalDate.parse(start_str);
		LocalDate end = LocalDate.parse(end_str);

		List<ClosedDayDTO> response = closedDayService.getWeeklyList(start, end);
		LOGGER.info("Month holiday range response: {}", response);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/programm")
	public ResponseEntity<List<ProgramInfoDTO>> programm() {
		LOGGER.info("Programm request");
		List<ProgramInfoDTO> response = programService.getAllPrograms();
		LOGGER.info("Programm response: {}", response);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/memberreservation")
	public ResponseEntity <ChatMemberReservationResponseDTO> memberReservation(@RequestHeader("X-User-ID") String mid) {
		LOGGER.info("Member reservation request for mid: {}", mid);
		ChatMemberReservationResponseDTO dto = memberService.getChatMemberReservationState(mid);
		LOGGER.info("Member reservation response: {}", dto);
		return ResponseEntity.ok(dto);
		
	}

}
