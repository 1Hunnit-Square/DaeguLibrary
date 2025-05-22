package com.dglib.controller.admin;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.controller.book.BookController;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.dto.book.LibraryBookSummaryDTO;
import com.dglib.dto.book.RentBookDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(BookController.class);
	private final BookService bookService;
	private final MemberService serviceMember;
	
	@PostMapping("/regbook")
	public ResponseEntity<String> regBook(@RequestBody BookRegistrationDTO bookRegistration) {
		LOGGER.info("도서 등록 요청: {}", bookRegistration);
		bookService.registerBook(bookRegistration);
		LOGGER.info("도서 등록 성공");
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/regbookcheck/{isbn}")
	public ResponseEntity<BookRegistrationDTO> regBookCheck(@PathVariable String isbn) {
		LOGGER.info("isbn: {}", isbn);
		BookRegistrationDTO regBookCheckDto = bookService.getLibraryBookList(isbn);
		return ResponseEntity.ok(regBookCheckDto);
	}
	
	@DeleteMapping("/deletelibrarybook/{libraryBookId}/{isbn}")
	public ResponseEntity<String> deleteLibraryBook(@PathVariable Long libraryBookId, @PathVariable String isbn) {
		LOGGER.info("도서 삭제 요청: {}", libraryBookId + ", " + isbn);
		bookService.deleteLibraryBook(libraryBookId, isbn);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/borrowbook")
	public ResponseEntity<String> rentBook(@RequestBody RentBookDTO rentBookDto) {
		LOGGER.info("도서 대출 요청: {}", rentBookDto);
		bookService.rentBook(rentBookDto.getLibraryBookId(), rentBookDto.getMno());
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("searchmembernumber/{memberNumber}")
	public ResponseEntity<Page<MemberSeaerchByMnoDTO>> searchMemberNumber(@PathVariable String memberNumber, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("memberNumber: {}", memberNumber);
		Pageable pageable = PageRequest.of(page -1, size);
		Page<MemberSeaerchByMnoDTO> memberList = serviceMember.searchByMno(memberNumber, pageable);
		

		return ResponseEntity.ok(memberList);
	}
	
	@GetMapping("/searchlibrarybook/{libraryBookId}")
	public ResponseEntity<Page<LibraryBookSearchByBookIdDTO>> searchMemberNumber(@PathVariable Long libraryBookId, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size){
		LOGGER.info("libraryBookId: {}", libraryBookId);
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<LibraryBookSearchByBookIdDTO> memberList = bookService.searchByLibraryBookBookId(libraryBookId, pageable);
		return ResponseEntity.ok(memberList);
	}
	
	@GetMapping("/rentallist")
	public ResponseEntity<Page<RentalBookListDTO>> getRentalList(@ModelAttribute BorrowedBookSearchDTO borrowedBookSearchDto ) {
		LOGGER.info(borrowedBookSearchDto + " ");
		int page = Optional.ofNullable(borrowedBookSearchDto.getPage()).orElse(1);
		int size = Optional.ofNullable(borrowedBookSearchDto.getSize())
                .orElse(10);
		String sortBy = Optional.ofNullable(borrowedBookSearchDto.getSortBy()).orElse("rentId");
		String orderBy = Optional.ofNullable(borrowedBookSearchDto.getOrderBy()).orElse("desc");
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
			    ? Sort.by(sortBy).ascending() 
			    : Sort.by(sortBy).descending();
		
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<RentalBookListDTO> rentalList = bookService.getRentalList(pageable, borrowedBookSearchDto);
		LOGGER.info("rentalList: {}", rentalList);
		return ResponseEntity.ok(rentalList);
	}
	
	@PostMapping("/returnbook")
	public ResponseEntity<String> returnBook(@RequestBody List<RentalStateChangeDTO> rentalStateChangeDto) {
        LOGGER.info("도서 반납 요청: {}", rentalStateChangeDto);
        bookService.completeBookReturn(rentalStateChangeDto);
        return ResponseEntity.ok().build();
	}
	@GetMapping("/reservebooklist")
	public ResponseEntity<Page<ReserveBookListDTO>> reserveBookList(@ModelAttribute BorrowedBookSearchDTO borrowedBookSearchDto) {
		LOGGER.info(borrowedBookSearchDto + " ");
		borrowedBookSearchDto.updateDateTimeRange();
		int page = Optional.ofNullable(borrowedBookSearchDto.getPage()).orElse(1);
		int size = Optional.ofNullable(borrowedBookSearchDto.getSize())
                .orElse(10);
		String sortBy = Optional.ofNullable(borrowedBookSearchDto.getSortBy()).orElse("reserveId");
		String orderBy = Optional.ofNullable(borrowedBookSearchDto.getOrderBy()).orElse("desc");
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
			    ? Sort.by(sortBy).ascending() 
			    : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		
		Page<ReserveBookListDTO> reserveList = bookService.getReserveList(pageable, borrowedBookSearchDto);
		LOGGER.info("reserveList: {}", reserveList);
		return ResponseEntity.ok(reserveList);
	}
	
	@PostMapping("/cancelreservebook")
	public ResponseEntity<String> cancelReserveBook(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
        LOGGER.info("도서 예약 취소 요청: {}", reserveStateChangeDtos);
        bookService.cancelReserveBook(reserveStateChangeDtos);
        return ResponseEntity.ok().build();
	}
	
	
	@PostMapping("/completeborrowing")
	public ResponseEntity<String> completeBorrowing(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
		LOGGER.info("도서 대출 완료 요청: {}", reserveStateChangeDtos);
		bookService.completeBorrowing(reserveStateChangeDtos);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/librarybooklist")
	public ResponseEntity<Page<LibraryBookSummaryDTO>> getLibraryBookList(@ModelAttribute LibraryBookSearchDTO libraryBookSearchDto) {
		LOGGER.info(libraryBookSearchDto + " ");
		int page = Optional.ofNullable(libraryBookSearchDto.getPage()).orElse(1);
		int size = Optional.ofNullable(libraryBookSearchDto.getSize()).orElse(10);
		String sortBy = Optional.ofNullable(libraryBookSearchDto.getSortBy()).orElse("libraryBookId");
		String orderBy = Optional.ofNullable(libraryBookSearchDto.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<LibraryBookSummaryDTO> libraryBookList = bookService.getLibraryBookList(pageable, libraryBookSearchDto);
		return ResponseEntity.ok(libraryBookList);
		
	}

}
