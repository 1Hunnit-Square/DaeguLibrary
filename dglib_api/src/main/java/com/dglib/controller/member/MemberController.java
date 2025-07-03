package com.dglib.controller.member;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.EbookMemberDeleteDTO;
import com.dglib.dto.book.EbookMemberRequestDTO;
import com.dglib.dto.book.EbookMemberResponseDTO;
import com.dglib.dto.book.HighlightRequestDTO;
import com.dglib.dto.book.HighlightResponseDTO;
import com.dglib.dto.book.HighlightUpdateDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.PageSaveRequestDTO;
import com.dglib.dto.book.RegWishBookDTO;
import com.dglib.dto.book.ReserveBookDTO;
import com.dglib.dto.member.BorrowHistoryRequestDTO;
import com.dglib.dto.member.ContactListDTO;
import com.dglib.dto.member.ContactSearchDTO;
import com.dglib.dto.member.EmailInfoListDTO;
import com.dglib.dto.member.EmailInfoSearchDTO;
import com.dglib.dto.member.MemberBasicDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberDTO;
import com.dglib.dto.member.MemberEbookDetailDTO;
import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberPhoneDTO;
import com.dglib.dto.member.MemberReserveListDTO;
import com.dglib.dto.member.MemberScanDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.MemberStatsDTO;
import com.dglib.dto.member.MemberWishBookListDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.security.jwt.JwtProvider;
import com.dglib.service.book.BookService;
import com.dglib.service.member.MemberCardService;
import com.dglib.service.member.MemberDetailService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

	private final Logger LOGGER = LoggerFactory.getLogger(MemberController.class);
	private final MemberService memberService;
	private final MemberDetailService memberDetailService;
	private final MemberCardService cardService;
	private final BookService bookService;

	@GetMapping("searchmembernumber/{memberNumber}")
	public ResponseEntity<Page<MemberSearchByMnoDTO>> searchMemberNumber(@PathVariable String memberNumber,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("memberNumber: {}", memberNumber);
		Pageable pageable = PageRequest.of(page - 1, size);
		Page<MemberSearchByMnoDTO> memberList = memberService.searchByMno(memberNumber, pageable);

		return ResponseEntity.ok(memberList);
	}

	@GetMapping("/listMember")
	public ResponseEntity<Page<MemberListDTO>> listMember(@ModelAttribute MemberSearchDTO searchDTO) {
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("mno");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<MemberListDTO> memberList = memberService.findAll(searchDTO, pageable);
		return ResponseEntity.ok(memberList);
	}

	@GetMapping("/listContact")
	public ResponseEntity<List<ContactListDTO>> listContact(@ModelAttribute ContactSearchDTO searchDTO) {

		Sort sort = Sort.by("mno").descending();

		List<ContactListDTO> memberList = memberService.getContactList(searchDTO, sort);
		return ResponseEntity.ok(memberList);
	}
	
	
	@GetMapping("/listEmailInfo")
	public ResponseEntity<List<EmailInfoListDTO>> listEmailInfo(@ModelAttribute EmailInfoSearchDTO searchDTO) {

		Sort sort = Sort.by("mno").descending();

		List<EmailInfoListDTO> memberList = memberService.getEmailInfoList(searchDTO, sort);
		return ResponseEntity.ok(memberList);
	}

	@PostMapping("/manageMember")
	public ResponseEntity<String> manageMember(@ModelAttribute MemberManageDTO memberManageDTO) {
		memberService.manageMember(memberManageDTO);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/register")
	public ResponseEntity<String> regMember(@RequestBody RegMemberDTO regMemberDTO) {
		memberService.registerMember(regMemberDTO);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/cardinfo")
	public ResponseEntity<Map<String, String>> getCardInfo(@RequestParam String mid) {
		return ResponseEntity.ok(cardService.setQRinfo(mid));
	}
	
	@PostMapping("/qrscan")
	public ResponseEntity<MemberScanDTO> qrScan(@RequestBody Map<String, String> qrinfo) {
		return ResponseEntity.ok(cardService.verifyQRinfo(qrinfo));
	}

	@GetMapping("/existId")
	public ResponseEntity<Boolean> existById(@RequestParam String mid) {
		return ResponseEntity.ok(memberService.existById(mid));
	}

	@GetMapping("/existPhone")
	public ResponseEntity<Boolean> existByPhone(@RequestParam String phone) {
		return ResponseEntity.ok(memberService.existByPhone(phone));
	}
	
	@GetMapping("/checkPhoneId")
	public ResponseEntity<Boolean> checkPhoneId(@RequestParam String phone) {
		return ResponseEntity.ok(memberService.checkPhoneIdMember(JwtFilter.getMid(), phone));
	}

	@GetMapping("/findId")
	public ResponseEntity<String> findId(@ModelAttribute MemberFindIdDTO memberFindIdDTO) {
		return ResponseEntity.ok(memberService.findId(memberFindIdDTO));
	}

	@GetMapping("/existAccount")
	public ResponseEntity<Boolean> existAccount(@ModelAttribute MemberFindAccountDTO memberFindAccountDTO) {
		return ResponseEntity.ok(memberService.existAccount(memberFindAccountDTO));
	}

	@PostMapping("/modPwMember")
	public ResponseEntity<String> findId(@RequestParam String mid, String pw) {
		memberService.modPwMember(mid, pw);
		return ResponseEntity.ok().build();
	}
	

	@GetMapping("/getMemberInfo")
	public ResponseEntity<MemberInfoDTO> getMemberInfo(@RequestParam String pw) {
		String mid = JwtFilter.getMid();
		System.out.println(mid);
		return ResponseEntity.ok(memberService.findMemberInfo(mid, pw));
	}

	@PostMapping("/modify")
	public ResponseEntity<MemberInfoDTO> modMember(@RequestBody ModMemberDTO modMemberDTO) {
		String mid = JwtFilter.getMid();
		System.out.println(mid);
		memberService.modifyMember(mid, modMemberDTO);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/leave")
	public ResponseEntity<String> leaveMember(@RequestParam String mid){
		memberService.leaveMember(mid);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/kakaoAuth")
	public ResponseEntity<Map<String, Object>> kakaoAuth(@RequestParam String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + accessToken);
		String email = memberService.getKakaoEmail(headers);
		try {
			MemberDTO memberDTO = (MemberDTO) memberDetailService.loadUserByKakao(email);
			return ResponseEntity.ok(JwtProvider.responseToken(memberDTO));
		} catch (UsernameNotFoundException e) {
			Map<String, Object> result = Map.of("error", e.getMessage());
			return ResponseEntity.ok(result);
		}

	}

	@PostMapping("/kakaoRegister")
	public ResponseEntity<String> kakaoReg(@RequestParam String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + accessToken);
		String email = memberService.getKakaoEmail(headers);
		memberService.regKakao(email);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/getKakaoEmail")
	public ResponseEntity<String> getkakaoEmail(@RequestParam String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + accessToken);
		String email = memberService.getKakaoEmail(headers);
		return ResponseEntity.ok(email);
	}

	@GetMapping("/interestedbook")
	public ResponseEntity<Page<InterestedBookResponseDTO>> getInterestedBookList(
			@ModelAttribute InterestedBookRequestDTO interestedBookRequestDto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("관심도서 요청: {}, 회원 id : {}", interestedBookRequestDto, mid);
		int page = Optional.ofNullable(interestedBookRequestDto.getPage()).orElse(1);
		Pageable pageable = PageRequest.of(page - 1, 10);
		Page<InterestedBookResponseDTO> interestedBookList = memberService.getInterestedBookList(pageable,
				interestedBookRequestDto, mid);

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
		memberService.addInterestedBook(mid, addInteredtedBookDto);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/deleteinterestedbook")
	public ResponseEntity<String> deleteInterestedBook(@RequestBody InteresdtedBookDeleteDTO interesdtedBookDeleteDto) {
		LOGGER.info("관심도서 삭제 요청: {}", interesdtedBookDeleteDto);
		String mid = JwtFilter.getMid();
		LOGGER.info("관심도서 삭제 요청: {}", mid);
		memberService.deleteInterestedBook(interesdtedBookDeleteDto, mid);
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

	@GetMapping("/info")
	public ResponseEntity<MemberBasicDTO> fetchMemberInfo() {
		String mid = JwtFilter.getMid();
		return ResponseEntity.ok(memberService.getMemberBasicInfo(mid));
	}

	@PostMapping("/validate")
	public ResponseEntity<Map<String, Object>> validateMemberIds(@RequestBody List<String> mids) {
		List<String> notFound = mids.stream().filter(mid -> !memberService.existById(mid)).toList();

		Map<String, Object> result = Map.of("valid", notFound.isEmpty(), "invalidIds", notFound);

		return ResponseEntity.ok(result);
	}

	@GetMapping("/memberborrowhistory")
	public ResponseEntity<Page<MemberBorrowHistoryDTO>> getMemberBorrowHistory(
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size,
			BorrowHistoryRequestDTO borrowHistoryRequestDTO) {
		String mid = JwtFilter.getMid();
		LOGGER.info(borrowHistoryRequestDTO + "");
		LOGGER.info("회원 대출이력 요청: {}, 페이지: {}, 사이즈: {}", mid, page, size);
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by("rentStartDate").descending());
		Page<MemberBorrowHistoryDTO> borrowHistory = memberService.getMemberBorrowHistory(mid, pageable,
				borrowHistoryRequestDTO);
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

	@GetMapping("/ebookinfo/{ebookId}")
	public ResponseEntity<MemberEbookDetailDTO> getEbookDetail(@PathVariable Long ebookId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("전자책 상세 정보 요청: {}, 회원 id: {}", ebookId, mid);
		MemberEbookDetailDTO ebookDetail = memberService.getMemberEbookDetail(ebookId, mid);
		return ResponseEntity.ok(ebookDetail);
	}

	@GetMapping("/highlights/{ebookId}")
	public ResponseEntity<List<HighlightResponseDTO>> getHighlights(@PathVariable Long ebookId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("전자책 하이라이트 목록 요청: {}, 회원 id: {}", ebookId, mid);
		List<HighlightResponseDTO> highlights = bookService.getHighlights(mid, ebookId);
		return ResponseEntity.ok(highlights);
	}

	@PostMapping("/addhighlight")
	public ResponseEntity<HighlightResponseDTO> addHighlight(@RequestBody HighlightRequestDTO dto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("하이라이트 추가 요청: {}, 회원 id: {}", dto, mid);
		bookService.addHighlight(mid, dto);
		return ResponseEntity.ok().build();
	}

	@PutMapping("/updatehighlight")
	public ResponseEntity<String> updateHighlight(@RequestBody HighlightUpdateDTO dto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("하이라이트 수정 요청: {}, 회원 id: {}", dto, mid);
		bookService.updateHighlight(mid, dto);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/deletehighlight/{highlightId}")
	public ResponseEntity<String> deleteHighlight(@PathVariable Long highlightId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("하이라이트 삭제 요청: {}, 회원 id: {}", highlightId, mid);
		bookService.deleteHighlight(mid, highlightId);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/savepage")
	public ResponseEntity<String> savePage(@RequestBody PageSaveRequestDTO dto) {
		String mid = JwtFilter.getMid();

		bookService.savePage(mid, dto);
		LOGGER.info("페이지 저장 완료");

		return ResponseEntity.ok().build();
	}

	@GetMapping("/currentpage/{ebookId}")
	public ResponseEntity<String> getCurrentPage(@PathVariable Long ebookId) {
		String mid = JwtFilter.getMid();
		LOGGER.info("저장된 페이지 요청: {}, 회원 id: {}", ebookId, mid);
		String startCfi = bookService.getSavedPage(mid, ebookId);
		LOGGER.info("저장된 페이지: {}", startCfi);
		return ResponseEntity.ok(startCfi);
	}

	@GetMapping("/myebook")
	public ResponseEntity<Page<EbookMemberResponseDTO>> getMyEbookList(EbookMemberRequestDTO dto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 전자책 목록 요청: {}, 페이지: {}, 사이즈: {}", mid, dto.getPage(), 10);
		Pageable pageable = PageRequest.of(dto.getPage() - 1, 10);
		Page<EbookMemberResponseDTO> ebookList = memberService.getMyEbookList(pageable, dto, mid);
		return ResponseEntity.ok(ebookList);
	}

	@DeleteMapping("/deleteebook")
	public ResponseEntity<String> deleteEbooks(@RequestBody EbookMemberDeleteDTO dto) {
		String mid = JwtFilter.getMid();
		LOGGER.info("회원 전자책 삭제 요청: {}, 회원 id: {}", dto, mid);
		memberService.deleteMyEbook(dto, mid);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/getMemberStats")
	public ResponseEntity<MemberStatsDTO> getMemberStats() {
		MemberStatsDTO statsDTO = new MemberStatsDTO();
		statsDTO.setGenderCount(memberService.getGenderCount());
		statsDTO.setAgeCount(memberService.getAgeCount());
		statsDTO.setRegionCount(memberService.getRegionCount());
		
		return ResponseEntity.ok(statsDTO);
	}


}
