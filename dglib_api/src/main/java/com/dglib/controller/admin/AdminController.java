package com.dglib.controller.admin;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.controller.book.BookController;
import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;
import com.dglib.dto.admin.BoardTypeDTO;
import com.dglib.dto.book.AdminWishBookListDTO;
import com.dglib.dto.book.AdminWishBookSearchDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.EbookRegistrationDTO;
import com.dglib.dto.book.EbookSearchDTO;
import com.dglib.dto.book.EbookSummaryDTO;
import com.dglib.dto.book.EbookUpdateDTO;
import com.dglib.dto.book.LibraryBookChangeDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.dto.book.LibraryBookSummaryDTO;
import com.dglib.dto.book.RentBookDTO;
import com.dglib.dto.book.RentalPageDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.book.Top10Books;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.service.admin.AdminBoardService;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

	private final Logger LOGGER = LoggerFactory.getLogger(BookController.class);
	private final BookService bookService;
	private final MemberService memberService;
	private final AdminBoardService adminBoardService;

	@PostMapping("/regbook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> regBook(@RequestBody BookRegistrationDTO bookRegistration) {
		LOGGER.info("도서 등록 요청: {}", bookRegistration);
		bookService.registerBook(bookRegistration);
		LOGGER.info("도서 등록 성공");
		return ResponseEntity.ok().build();
	}

	@GetMapping("/regbookcheck/{isbn}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<BookRegistrationDTO> regBookCheck(@PathVariable String isbn) {
		LOGGER.info("isbn: {}", isbn);
		BookRegistrationDTO regBookCheckDto = bookService.getLibraryBookList(isbn);
		return ResponseEntity.ok(regBookCheckDto);
	}

	@PostMapping("/changelibrarybook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> deleteLibraryBook(@RequestBody LibraryBookChangeDTO libraryBookChangeDto) {
		LOGGER.info("도서 삭제 요청: {}", libraryBookChangeDto);
		bookService.changeLibraryBook(libraryBookChangeDto.getLibraryBookId(), libraryBookChangeDto.getState());
		return ResponseEntity.ok().build();
	}

	@PostMapping("/borrowbook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> rentBook(@RequestBody RentBookDTO rentBookDto) {
		LOGGER.info("도서 대출 요청: {}", rentBookDto);
		bookService.rentBook(rentBookDto.getLibraryBookId(), rentBookDto.getMno());
		return ResponseEntity.ok().build();
	}

	@GetMapping("searchmembernumber/{memberNumber}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<MemberSearchByMnoDTO>> searchMemberNumber(@PathVariable String memberNumber,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("memberNumber: {}", memberNumber);
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<MemberSearchByMnoDTO> memberList = memberService.searchByMno(memberNumber, pageable);

		return ResponseEntity.ok(memberList);
	}

	@GetMapping("/searchlibrarybook/{libraryBookId}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<LibraryBookSearchByBookIdDTO>> searchMemberNumber(@PathVariable Long libraryBookId,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("libraryBookId: {}", libraryBookId);
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<LibraryBookSearchByBookIdDTO> memberList = bookService.searchByLibraryBookBookId(libraryBookId, pageable);
		return ResponseEntity.ok(memberList);
	}

	@GetMapping("/rentallist")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<RentalPageDTO> getRentalList(@ModelAttribute BorrowedBookSearchDTO borrowedBookSearchDto) {
		LOGGER.info(borrowedBookSearchDto + " ");
		int page = Optional.ofNullable(borrowedBookSearchDto.getPage()).orElse(1);
		int size = Optional.ofNullable(borrowedBookSearchDto.getSize()).orElse(10);
		String sortBy = Optional.ofNullable(borrowedBookSearchDto.getSortBy()).orElse("rentId");
		String orderBy = Optional.ofNullable(borrowedBookSearchDto.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		RentalPageDTO rentalList = bookService.getRentalList(pageable, borrowedBookSearchDto);
		LOGGER.info("rentalList: {}", rentalList);
		return ResponseEntity.ok(rentalList);
	}

	@PostMapping("/returnbook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> returnBook(@RequestBody List<RentalStateChangeDTO> rentalStateChangeDto) {
		LOGGER.info("도서 반납 요청: {}", rentalStateChangeDto);
		bookService.completeBookReturn(rentalStateChangeDto);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/reservebooklist")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<ReserveBookListDTO>> reserveBookList(
			@ModelAttribute BorrowedBookSearchDTO borrowedBookSearchDto) {
		LOGGER.info(borrowedBookSearchDto + " ");
		borrowedBookSearchDto.updateDateTimeRange();
		int page = Optional.ofNullable(borrowedBookSearchDto.getPage()).orElse(1);
		int size = Optional.ofNullable(borrowedBookSearchDto.getSize()).orElse(10);
		String sortBy = Optional.ofNullable(borrowedBookSearchDto.getSortBy()).orElse("reserveId");
		String orderBy = Optional.ofNullable(borrowedBookSearchDto.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page - 1, size, sort);

		Page<ReserveBookListDTO> reserveList = bookService.getReserveList(pageable, borrowedBookSearchDto);
		LOGGER.info("reserveList: {}", reserveList);
		return ResponseEntity.ok(reserveList);
	}

	@PostMapping("/cancelreservebook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> cancelReserveBook(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
		LOGGER.info("도서 예약 취소 요청: {}", reserveStateChangeDtos);
		bookService.cancelReserveBook(reserveStateChangeDtos);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/completeborrowing")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> completeBorrowing(@RequestBody List<ReserveStateChangeDTO> reserveStateChangeDtos) {
		LOGGER.info("도서 대출 완료 요청: {}", reserveStateChangeDtos);
		bookService.completeBorrowing(reserveStateChangeDtos);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/librarybooklist")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<LibraryBookSummaryDTO>> getLibraryBookList(
			@ModelAttribute LibraryBookSearchDTO libraryBookSearchDto) {
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

	@PostMapping("/updateoverduemember")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> updateOverdueMember() {
		LOGGER.info("연체 회원 업데이트 요청");
		memberService.executeOverdueCheck();
		return ResponseEntity.ok().build();
	}

	@GetMapping("wishbooklist")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<AdminWishBookListDTO>> getWishBookList(AdminWishBookSearchDTO dto) {
		LOGGER.info("위시리스트 도서 조회 요청 {}", dto);
		int page = Optional.ofNullable(dto.getPage()).orElse(1);
		int size = Optional.ofNullable(dto.getSize()).orElse(10);
		String sortBy = Optional.ofNullable(dto.getSortBy()).orElse("wishNo");
		String orderBy = Optional.ofNullable(dto.getOrderBy()).orElse("desc");
		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<AdminWishBookListDTO> wishBookList = bookService.getWishBookList(pageable, dto);
		return ResponseEntity.ok(wishBookList);
	}

	@PostMapping("/rejectwishbook/{wishNo}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> rejectWishBook(@PathVariable Long wishNo) {
		LOGGER.info("위시리스트 도서 거절 요청: {}", wishNo);
		bookService.rejectWishBook(wishNo);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/regebook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> regEbook(EbookRegistrationDTO dto) {
		LOGGER.info("전자책 등록 요청 {}", dto);

		bookService.regEbook(dto);

		LOGGER.info("전자책 등록 성공");
		return ResponseEntity.ok().build();
	}

	@GetMapping("/ebooklist")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Page<EbookSummaryDTO>> getEbookList(@ModelAttribute EbookSearchDTO dto) {
		LOGGER.info(dto + " ");
		int page = Optional.ofNullable(dto.getPage()).orElse(1);
		int size = Optional.ofNullable(dto.getSize()).orElse(10);
		String sortBy = Optional.ofNullable(dto.getSortBy()).orElse("ebookId");
		String orderBy = Optional.ofNullable(dto.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<EbookSummaryDTO> ebookList = bookService.getEbookAdminList(pageable, dto);
		return ResponseEntity.ok(ebookList);

	}

	@PostMapping("/updateebook")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> updateEbook(@ModelAttribute EbookUpdateDTO dto) {
		LOGGER.info("전자책 수정 요청 {}", dto);
		bookService.updateEbook(dto);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/deleteebook/{ebookId}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> deleteEbook(@PathVariable Long ebookId) {
		LOGGER.info("전자책 삭제 요청: {}", ebookId);
		bookService.deleteEbook(ebookId);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/top10books")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<Top10Books>> getTop10Books(@RequestParam(required = false) LocalDate startDate,
			@RequestParam(required = false) LocalDate endDate) {
		LOGGER.info("Top 10 books request with startDate: {}, endDate: {}", startDate, endDate);
		List<Top10Books> top10Books = bookService.getTop10Books(startDate, endDate);

		return ResponseEntity.ok(top10Books);
	}

	// 관리자 게시판 리스트
	@GetMapping("/board")
	@PreAuthorize("hasRole('ADMIN')")
	public Page<BoardListDTO> getBoards(@ModelAttribute BoardSearchDTO dto, Pageable pageable) {
		if ("notice".equals(dto.getBoardType())) {
			return adminBoardService.getNoticeList(dto, pageable);
		} else if ("news".equals(dto.getBoardType())) {
			return adminBoardService.getNewsList(dto, pageable);
		} else if ("event".equals(dto.getBoardType())) {
			return adminBoardService.getEventList(dto, pageable);
		} else if ("gallery".equals(dto.getBoardType())) {
			return adminBoardService.getGalleryList(dto, pageable);
		}
		throw new IllegalArgumentException("지원하지 않는 게시판 타입입니다.");
	}

	@PutMapping("/board/hide")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> hideBoards(@RequestBody BoardTypeDTO request) {
		adminBoardService.hideBoards(request.getBoardType(), request.getIds(), request.isHidden());
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/board")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteBoards(@RequestBody BoardTypeDTO request) {
		adminBoardService.deleteBoards(request.getBoardType(), request.getIds());
		return ResponseEntity.ok().build();
	}
}
