package com.dglib.controller.member;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.RegWishBookDTO;
import com.dglib.dto.book.ReserveBookDTO;
import com.dglib.dto.member.BorrowHistoryRequestDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberPhoneDTO;
import com.dglib.dto.member.MemberReserveListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.MemberWishBookListDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.security.jwt.JwtFilter;
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
	
	@GetMapping("/listMember")
	public ResponseEntity<Page<MemberListDTO>> listMember(@ModelAttribute MemberSearchDTO searchDTO){
		System.out.println(searchDTO);
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("mno");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
			    ? Sort.by(sortBy).ascending() 
			    : Sort.by(sortBy).descending();
		
		
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<MemberListDTO> memberList = memberService.findAll(searchDTO, pageable);
		return ResponseEntity.ok(memberList);
	}
	
	@PostMapping("/manageMember")
	public ResponseEntity<String> manageMember(@ModelAttribute MemberManageDTO memberManageDTO){
		memberService.manageMember(memberManageDTO);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/register")
	public ResponseEntity<String> regMember (@RequestBody RegMemberDTO regMemberDTO){
		memberService.registerMember(regMemberDTO);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/cardinfo")
	public ResponseEntity<Map<String, String>> getCardInfo (@RequestParam String mid){
		return ResponseEntity.ok(cardService.setQRinfo(mid));
	}
	
	@GetMapping("/existId")
	public ResponseEntity<Boolean> existById(@RequestParam String mid){
		return ResponseEntity.ok(memberService.existById(mid));
	}
	
	@GetMapping("/existPhone")
	public ResponseEntity<Boolean> existByPhone(@RequestParam String phone){
		return ResponseEntity.ok(memberService.existByPhone(phone));
	}
	
	@GetMapping("/findId")
	public ResponseEntity<String> findId(@ModelAttribute MemberFindIdDTO memberFindIdDTO){
		return ResponseEntity.ok(memberService.findId(memberFindIdDTO));
	}
	
	@GetMapping("/existAccount")
	public ResponseEntity<Boolean> existAccount(@ModelAttribute MemberFindAccountDTO memberFindAccountDTO){
		return ResponseEntity.ok(memberService.existAccount(memberFindAccountDTO));
	}
	
	@PostMapping("/modPwMember")
	public ResponseEntity<String> findId(@RequestParam String mid, String pw){
		memberService.modPwMember(mid, pw);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/getMemberInfo")
	public ResponseEntity<MemberInfoDTO> getMemberInfo(@RequestParam String pw){
		String mid = JwtFilter.getMid();
		System.out.println(mid);
		return ResponseEntity.ok(memberService.findMemberInfo(mid, pw));
	}
	
	@PostMapping("/modify")
	public ResponseEntity<MemberInfoDTO> modMember(@RequestBody ModMemberDTO modMemberDTO){
		String mid = JwtFilter.getMid();
		System.out.println(mid);
		memberService.modifyMember(mid, modMemberDTO);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/interestedbook")
	public ResponseEntity<Page<InterestedBookResponseDTO>> getInterestedBookList(@ModelAttribute InterestedBookRequestDTO interestedBookRequestDto, @RequestHeader(value = "Authorization", required = true) String authHeader ) {
		String mid = JwtFilter.getMid();
		LOGGER.info("관심도서 요청: {}, 회원 id : {}", interestedBookRequestDto, mid);
		int page = Optional.ofNullable(interestedBookRequestDto.getPage()).orElse(1);
		Pageable pageable = PageRequest.of(page - 1, 10);
		Page<InterestedBookResponseDTO> interestedBookList = bookService.getInterestedBookList(pageable, interestedBookRequestDto, mid);
		
		return ResponseEntity.ok(interestedBookList);
	}
	
	@PostMapping("/reservebook")
	public ResponseEntity<String> reserveBook(@RequestBody ReserveBookDTO reserveDto) {
		String mid = JwtFilter.getMid();
		bookService.reserveBook(reserveDto.getLibraryBookId(), mid);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/unmannedreserve")
	public ResponseEntity<String> unmannedReserveBook(@RequestBody ReserveBookDTO reserveDto) {
		LOGGER.info("무인 예약 요청: {}", reserveDto);
		String mid = JwtFilter.getMid();
		bookService.unMannedReserveBook(reserveDto.getLibraryBookId(), mid);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/addinterestedbook")
	public ResponseEntity<String> addInterestedBook(@RequestBody AddInterestedBookDTO addInteredtedBookDto) {
		String mid = JwtFilter.getMid();
		LOGGER.info(mid);
		LOGGER.info("관심도서 추가 요청: {}", addInteredtedBookDto);
		bookService.addInterestedBook(mid, addInteredtedBookDto);
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/deleteinterestedbook")
	public ResponseEntity<String> deleteInterestedBook(@RequestBody InteresdtedBookDeleteDTO interesdtedBookDeleteDto) {
		LOGGER.info("관심도서 삭제 요청: {}", interesdtedBookDeleteDto);
		String mid = JwtFilter.getMid();
		LOGGER.info("관심도서 삭제 요청: {}", mid);
		bookService.deleteInterestedBook(interesdtedBookDeleteDto, mid);
		
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/memberborrowlist")
	public ResponseEntity<List<MemberBorrowNowListDTO>> getMemberBorrowNowList() {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 대출목록 요청: {}", mid);
		List<MemberBorrowNowListDTO> dto = memberService.getMemberBorrowNowList(mid);
		return ResponseEntity.ok(dto);
	}
	
	@PostMapping("/extendborrow")
	public ResponseEntity<String> extendBorrow(@RequestBody List<Long> rentIds) {
		String mid = JwtFilter.getMid();
		LOGGER.info("연장 요청: {}, 회원 id: {}", rentIds, mid);
		memberService.extendMemberBorrow(rentIds);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/memberborrowhistory")
	public ResponseEntity<Page<MemberBorrowHistoryDTO>> getMemberBorrowHistory(
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size,
			BorrowHistoryRequestDTO borrowHistoryRequestDTO) {
		String mid = JwtFilter.getMid();
		LOGGER.info(borrowHistoryRequestDTO + "");
		LOGGER.info("회원 대출이력 요청: {}, 페이지: {}, 사이즈: {}", mid, page, size);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("rentStartDate").descending());
		Page<MemberBorrowHistoryDTO> borrowHistory = memberService.getMemberBorrowHistory(mid, pageable, borrowHistoryRequestDTO);
		return ResponseEntity.ok(borrowHistory);
	}
	
	@GetMapping("/memberreservelist")
	public ResponseEntity<List<MemberReserveListDTO>> getMemberReserveList() {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 예약목록 요청: {}", mid);
		List<MemberReserveListDTO> dto = memberService.getMemberReserveList(mid);
		return ResponseEntity.ok(dto);
	}
	
	@DeleteMapping("/cancelreservebook")
	public ResponseEntity<String> cancelReserveBook(@RequestParam Long reserveId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 예약 취소 요청: {}, 회원 id: {}", reserveId, mid);
		memberService.cancelReserve(reserveId);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/yearborrowhistory")
	public ResponseEntity<Map<String, Map<String, Integer>>> cencelReserveBook() {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 연간 대출 이력 요청: {}", mid);
		Map<String, Map<String, Integer>> yearBorrowList = memberService.getMemberYearBorrowList(mid);
		LOGGER.info("연간 대출 이력: {}", yearBorrowList);
		return ResponseEntity.ok(yearBorrowList);
	}
	
	@GetMapping("/getmemberphone")
	public ResponseEntity<MemberPhoneDTO> getMemberPhone() {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 전화번호 요청: {}", mid);
		MemberPhoneDTO memberPhone = memberService.getMemberPhone(mid);
		return ResponseEntity.ok(memberPhone);
	}
	
	@PostMapping("/regwishbook")
	public ResponseEntity<String> regWishBook(@RequestBody RegWishBookDTO dto) {
        String mid = JwtFilter.getMid();
        bookService.regWishBook(dto, mid);
        LOGGER.info("회원 희망도서 회원 id: {}", mid);
        LOGGER.info("희망도서 등록 요청: {}", dto);
        return ResponseEntity.ok().build();
    }
	
	@GetMapping("/memberwishbooklist/{year}")
	public ResponseEntity<List<MemberWishBookListDTO>> memberWishBookList(@PathVariable int year) {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 희망도서 목록 요청: {}, 년도: {}", mid, year);
		List<MemberWishBookListDTO> wishBookList = memberService.getMemberWishBookList(mid, year);
		return ResponseEntity.ok(wishBookList);
	}
	
	@PostMapping("/cancelwishbook/{wishId}")
	public ResponseEntity<String> cancelWishBook(@PathVariable Long wishId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 희망도서 삭제 요청: {}, 회원 id: {}", wishId, mid);
		memberService.cancelWishBook(wishId, mid);
		return ResponseEntity.ok().build();
	}
	
	

	

}
