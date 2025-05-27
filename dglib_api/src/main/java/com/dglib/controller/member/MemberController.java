package com.dglib.controller.member;


import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.ReserveBookDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.security.jwt.JwtProvider;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberCardService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(MemberController.class);
	private final MemberService memberService;
	private final MemberCardService cardService;
	private final BookService bookService;
	
	@GetMapping("searchmembernumber/{memberNumber}")
	public ResponseEntity<Page<MemberSearchByMnoDTO>> searchMemberNumber(@PathVariable String memberNumber, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("memberNumber: {}", memberNumber);
		Pageable pageable = PageRequest.of(page -1, size);
		Page<MemberSearchByMnoDTO> memberList = memberService.searchByMno(memberNumber, pageable);
		

		return ResponseEntity.ok(memberList);
	}
	
	@PostMapping("/register")
	public ResponseEntity<String> regMember (@RequestBody RegMemberDTO regMemberDTO){
		memberService.registerMember(regMemberDTO);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/cardinfo")
	public ResponseEntity<Map<String, String>> getCardInfo (@RequestParam String mid){
		return ResponseEntity.ok(cardService.setQRinfo(mid));
	}
	
	@GetMapping("/existId")
	public ResponseEntity<Boolean> existById(@RequestParam String mid){
		return ResponseEntity.ok(memberService.existById(mid));
	}
	
	@GetMapping("/interestedbook")
	public ResponseEntity<Page<InterestedBookResponseDTO>> getInterestedBookList(@ModelAttribute InterestedBookRequestDTO interestedBookRequestDto, @RequestHeader(value = "Authorization", required = true) String authHeader ) {
		String mid = JwtProvider.getMid();
		LOGGER.info("관심도서 요청: {}, 회원 id : {}", interestedBookRequestDto, mid);
		int page = Optional.ofNullable(interestedBookRequestDto.getPage()).orElse(1);
		Pageable pageable = PageRequest.of(page - 1, 10);
		Page<InterestedBookResponseDTO> interestedBookList = bookService.getInterestedBookList(pageable, interestedBookRequestDto, mid);
		
		return ResponseEntity.ok(interestedBookList);
	}
	
	@PostMapping("/reservebook")
	public ResponseEntity<String> reserveBook(@RequestBody ReserveBookDTO reserveDto) {
		String mid = JwtProvider.getMid();
		bookService.reserveBook(reserveDto.getLibraryBookId(), mid);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/unmannedreserve")
	public ResponseEntity<String> unmannedReserveBook(@RequestBody ReserveBookDTO reserveDto) {
		LOGGER.info("무인 예약 요청: {}", reserveDto);
		String mid = JwtProvider.getMid();
		bookService.unMannedReserveBook(reserveDto.getLibraryBookId(), mid);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/addinterestedbook")
	public ResponseEntity<String> addInterestedBook(@RequestBody AddInterestedBookDTO addInteredtedBookDto) {
		String mid = JwtProvider.getMid();
		LOGGER.info(mid);
		LOGGER.info("관심도서 추가 요청: {}", addInteredtedBookDto);
		bookService.addInterestedBook(mid, addInteredtedBookDto);
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/deleteinterestedbook")
	public ResponseEntity<String> deleteInterestedBook(@RequestBody InteresdtedBookDeleteDTO interesdtedBookDeleteDto) {
		LOGGER.info("관심도서 삭제 요청: {}", interesdtedBookDeleteDto);
		String mid = JwtProvider.getMid();
		LOGGER.info("관심도서 삭제 요청: {}", mid);
		bookService.deleteInterestedBook(interesdtedBookDeleteDto, mid);
		
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/memberborrowlist")
	public ResponseEntity<List<MemberBorrowNowListDTO>> getMemberBorrowNowList() {
		String mid = JwtProvider.getMid();
		LOGGER.info("회원 대출목록 요청: {}", mid);
		List<MemberBorrowNowListDTO> dto = memberService.getMemberBorrowNowList(mid);
		return ResponseEntity.ok(dto);
	}
	
	@PostMapping("/extendborrow")
	public ResponseEntity<String> extendBorrow(@RequestBody List<Long> rentIds) {
		String mid = JwtProvider.getMid();
		LOGGER.info("연장 요청: {}, 회원 id: {}", rentIds, mid);
		memberService.extendMemberBorrow(rentIds);
		return ResponseEntity.ok().build();
	}
	


}
