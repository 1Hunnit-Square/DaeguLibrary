package com.dglib.service.member;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.BookStatusInfoDTO;
import com.dglib.dto.book.EbookMemberDeleteDTO;
import com.dglib.dto.book.EbookMemberRequestDTO;
import com.dglib.dto.book.EbookMemberResponseDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.RentalStatusDTO;
import com.dglib.dto.book.ReserveStatusDTO;
import com.dglib.dto.member.AgeCountDTO;
import com.dglib.dto.member.BorrowHistoryRequestDTO;
import com.dglib.dto.member.ChatMemberBorrowResponseDTO;
import com.dglib.dto.member.ChatMemberReservationBookDTO;
import com.dglib.dto.member.ChatMemberReservationResponseDTO;
import com.dglib.dto.member.ContactListDTO;
import com.dglib.dto.member.ContactSearchDTO;
import com.dglib.dto.member.EmailInfoListDTO;
import com.dglib.dto.member.EmailInfoSearchDTO;
import com.dglib.dto.member.GenderCountDTO;
import com.dglib.dto.member.MemberBasicDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberEbookDetailDTO;
import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberPhoneDTO;
import com.dglib.dto.member.MemberRecoBookDTO;
import com.dglib.dto.member.MemberReserveListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.MemberWishBookListDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.dto.member.RegionCountDTO;
import com.dglib.dto.sms.SmsReturnRequestDTO;
import com.dglib.entity.book.Ebook;
import com.dglib.entity.book.EbookReadingProgress;
import com.dglib.entity.book.Highlight;
import com.dglib.entity.book.InterestedBook;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.book.WishBook;
import com.dglib.entity.book.WishBookState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.book.EbookReadingProgressRepository;
import com.dglib.repository.book.EbookRepository;
import com.dglib.repository.book.EbookSpecifications;
import com.dglib.repository.book.HighlightRepository;
import com.dglib.repository.book.InterestedBookRepository;
import com.dglib.repository.book.InterestedBookSpecifications;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.book.RentalSpecifications;
import com.dglib.repository.book.ReserveRepository;
import com.dglib.repository.book.WishBookRepository;
import com.dglib.repository.book.WishBookSpecifications;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.member.MemberSpecifications;
import com.dglib.repository.place.PlaceRepository;
import com.dglib.repository.program.ProgramUseRepository;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.sms.SmsService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class MemberServiceImpl implements MemberService {

	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final LibraryBookRepository libraryBookRepository;

	private final PasswordEncoder passwordEncoder;
	private final RentalRepository rentalRepository;
	private final ReserveRepository reserveRepository;
	private final WishBookRepository wishBookRepository;
	private final SmsService smsService;

	private final String KAKAO_URL = "https://kapi.kakao.com/v2/user/me";

	private final InterestedBookRepository interestedBookRepository;
	private final EbookRepository ebookRepository;
	private final EbookReadingProgressRepository ebookReadingProgressRepository;
	private final Logger LOGGER = LoggerFactory.getLogger(MemberServiceImpl.class);
	private final HighlightRepository highlightRepository;
	private LocalDate lastSuccessOverdueCheckDate;
	private final PlaceRepository placeRepository;
	private final ProgramUseRepository programUseRepository;
	
	@Override
	public Page<MemberSearchByMnoDTO> searchByMno(String mno, Pageable pageable) {
		return memberRepository.findByMno(mno, pageable);
	}

	@Override
	public boolean existById(String mid) {
		return memberRepository.existsById(mid);
	}

	@Override
	public void registerMember(RegMemberDTO regMemberDTO) {
		Member member = modelMapper.map(regMemberDTO, Member.class);
		member.setPw(passwordEncoder.encode(member.getPw()));
		member.setRole(MemberRole.USER);
		member.setState(MemberState.NORMAL);
		member.setMno(setMno());
		memberRepository.save(member);
	}

	@Override
	public boolean existByPhone(String phone) {
		return memberRepository.existsByPhoneAndStateNot(phone, MemberState.LEAVE);
	}

	@Override
	public Page<MemberListDTO> findAll(MemberSearchDTO searchDTO, Pageable pageable) {
		Specification<Member> spec = MemberSpecifications.fromDTO(searchDTO);
		Page<Member> memberList = memberRepository.findAll(spec, pageable);

		Page<MemberListDTO> result = memberList.map(member -> {
			MemberListDTO memberListDTO = new MemberListDTO();
			modelMapper.map(member, memberListDTO);

			return memberListDTO;

		});

		return result;
	}

	@Override
	public List<ContactListDTO> getContactList(ContactSearchDTO searchDTO, Sort sort) {
		Specification<Member> spec = MemberSpecifications.fromDTO(searchDTO);
		List<Member> memberList = memberRepository.findAll(spec, sort);

		List<ContactListDTO> result = memberList.stream().map(member -> {

			List<LocalDate> overDateList = member.getOverRentalList().stream().map(Rental::getDueDate)
					.collect(Collectors.toList());

			LocalDate DueStartDate = null;
			if (!overDateList.isEmpty()) {
				DueStartDate = Collections.min(overDateList).plusDays(1L);
			}

			ContactListDTO listDTO = new ContactListDTO();
			modelMapper.map(member, listDTO);

			listDTO.setOverdueCount(overDateList.size());
			listDTO.setOverdueDate(DueStartDate);
			return listDTO;
		}).collect(Collectors.toList());

		return result;
	}

	@Override
	public List<EmailInfoListDTO> getEmailInfoList(EmailInfoSearchDTO searchDTO, Sort sort) {
		Specification<Member> spec = MemberSpecifications.fromDTO(searchDTO);
		List<Member> memberList = memberRepository.findAll(spec, sort);

		List<EmailInfoListDTO> result = memberList.stream()
				.map(member -> modelMapper.map(member, EmailInfoListDTO.class)).collect(Collectors.toList());

		return result;
	}

	@Override
	public void manageMember(MemberManageDTO memberManageDTO) {
		Member member = memberRepository.findById(memberManageDTO.getMid())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		member.setRole(memberManageDTO.getRole());
		member.setState(memberManageDTO.getState());
		member.setPenaltyDate(memberManageDTO.getPenaltyDate());
		memberRepository.save(member);
	}

	@Override
	public String findId(MemberFindIdDTO memberFindIdDTO) {
		Member member = memberRepository.findByNameAndBirthDateAndPhoneAndStateNot(memberFindIdDTO.getName(),
				memberFindIdDTO.getBirthDate(), memberFindIdDTO.getPhone(), MemberState.LEAVE)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		return member.getMid();
	}

	@Override
	public boolean existAccount(MemberFindAccountDTO memberFindAccountDTO) {
		return memberRepository.existsByMidAndBirthDateAndPhoneAndStateNot(memberFindAccountDTO.getMid(),
				memberFindAccountDTO.getBirthDate(), memberFindAccountDTO.getPhone(), MemberState.LEAVE);
	}

	@Override
	public void modPwMember(String mid, String pw) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		member.setPw(passwordEncoder.encode(pw));
		memberRepository.save(member);
	}

	@Override
	public MemberInfoDTO findMemberInfo(String mid, String pw) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		boolean valid = passwordEncoder.matches(pw, member.getPw());
		if (!valid) {
			throw new IllegalArgumentException("Password Different");
		}
		return modelMapper.map(member, MemberInfoDTO.class);
	}

	@Override
	public void modifyMember(String mid, ModMemberDTO modMemberDTO) {
		if (!mid.equals(modMemberDTO.getMid())) {
			throw new IllegalArgumentException("ID Different");
		}
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		String oldPw = member.getPw();
		modelMapper.map(modMemberDTO, member);
		if (modMemberDTO.getPw() != null) {
			member.setPw(passwordEncoder.encode(modMemberDTO.getPw()));
		} else {
			member.setPw(oldPw);
		}
		memberRepository.save(member);
	}
	
	@Override
	public void leaveMember(String mid) {
		if (!mid.equals(JwtFilter.getMid())) {
			throw new IllegalArgumentException("ID Different");
		}
		
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		
		if(isBorrowedMember(mid)) {
			 throw new IllegalArgumentException("EXIST BORROWED BOOKS");
		}
		
		
		member.setKakao(null);
		member.setPenaltyDate(null);
		deletePlaceProgram(mid);
		cancelAllReservesForMember(mid);
		member.setState(MemberState.LEAVE);
			
		memberRepository.save(member);
	}
	
	@Override
	public boolean checkPhoneIdMember(String mid, String phone) {	
		return memberRepository.existsByMidAndPhone(mid, phone);
	}

	@Override
	public String getKakaoEmail(HttpHeaders headers) {
		RestTemplate restTemplate = new RestTemplate();
		HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);

		ResponseEntity<Map<String, Object>> response = null;

		try {
			response = restTemplate.exchange(KAKAO_URL, HttpMethod.GET, requestEntity,
					new ParameterizedTypeReference<Map<String, Object>>() {
					});
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
				throw new IllegalArgumentException("Expired Token");
			} else {
				throw e;
			}
		}

		Map<String, Object> body = response.getBody();

		if (body == null)
			throw new IllegalArgumentException("Response Not Exist");

		@SuppressWarnings("unchecked")
		Map<String, Object> kakaoAccount = (Map<String, Object>) body.get("kakao_account");
		String email = (String) kakaoAccount.get("email");
		return email;
	}

	@Override
	public void regKakao(String kakaoEmail) {
		String mid = JwtFilter.getMid();
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		member.setKakao(kakaoEmail);
		memberRepository.save(member);
	}

	public String setMno() {
		String result = null;
		LocalDate today = LocalDate.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMdd");
		String fDate = today.format(formatter);

		Long newMno = memberRepository.countByMnoLike(fDate + "____");
		result = fDate + String.format("%04d", newMno + 1);

		return result;
	}

	@Override
	public void executeOverdueCheck() {
		checkOverdue();
		lastSuccessOverdueCheckDate = LocalDate.now();
	}

	private void checkOverdue() {
		List<Rental> overdueRentals = rentalRepository.findOverdueRentals(LocalDate.now());
		Map<Member, Long> overdueCountByMember = overdueRentals.stream()
				.filter(rental -> rental.getMember().getState() != MemberState.PUNISH
						&& rental.getMember().getState() != MemberState.LEAVE)
				.collect(Collectors.groupingBy(Rental::getMember, Collectors.counting()));
		Set<String> overdueMemberIds = overdueCountByMember.keySet().stream().map(Member::getMid)
				.collect(Collectors.toSet());

		List<Reserve> reservesToCancel = Collections.emptyList();
		if (!overdueMemberIds.isEmpty()) {
			reservesToCancel = reserveRepository.findByMemberMidInAndState(overdueMemberIds, ReserveState.RESERVED);
		}
		reservesToCancel.forEach(reserve -> {
			reserve.setState(ReserveState.CANCELED);
		});

		overdueCountByMember.forEach((member, count) -> {
			LOGGER.info("Member ID: {}, Overdue Count: {}", member.getMid(), count);
			member.setPenaltyDate(LocalDate.now().plusDays(count - 1));
			member.setState(MemberState.OVERDUE);

		});
		List<Member> releasedMember = memberRepository.findMembersWithPenaltyDateButNotOverdue();
		releasedMember.forEach(m -> {
			m.setPenaltyDate(null);
			m.setState(MemberState.NORMAL);
		});

	}

	@Override
	public boolean isLastSuccessOverdueCheckDateToday() {
		return lastSuccessOverdueCheckDate != null && lastSuccessOverdueCheckDate.equals(LocalDate.now());
	}

	@Override
	@Transactional(readOnly = true)
	public List<MemberBorrowNowListDTO> getMemberBorrowNowList(String mid) {
		Sort sort = Sort.by(Sort.Direction.DESC, "rentId");
		List<Rental> rentals = rentalRepository.findByMemberMidAndState(mid, RentalState.BORROWED, sort);
		return rentals.stream().map(rental -> {
			MemberBorrowNowListDTO dto = modelMapper.map(rental, MemberBorrowNowListDTO.class);
			dto.setBookTitle(rental.getLibraryBook().getBook().getBookTitle());
			dto.setAuthor(rental.getLibraryBook().getBook().getAuthor());
			dto.setIsbn(rental.getLibraryBook().getBook().getIsbn());
			dto.setReserveCount(rental.getLibraryBook().getReserves().stream()
					.filter(reserve -> reserve.getState() == com.dglib.entity.book.ReserveState.RESERVED
							&& reserve.isUnmanned() == false)
					.count());
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public void extendMemberBorrow(List<Long> rentIds) {
		List<Rental> rentals = rentalRepository.findWithDetailsByRentIdIn(rentIds);
		boolean isMemberOverdue = rentals.stream()
				.anyMatch(rental -> rental.getMember().getState() == MemberState.OVERDUE);
		boolean isReserve = rentals.stream()
				.anyMatch(rental -> rental.getLibraryBook().getReserves().stream()
						.anyMatch(reserve -> reserve.getState() == com.dglib.entity.book.ReserveState.RESERVED
								&& reserve.isUnmanned() == false));
		boolean isMemberPunish = rentals.stream()
				.anyMatch(rental -> rental.getMember().getState() == MemberState.PUNISH);
		boolean isAlreadyExtended = rentals.stream()
				.anyMatch(rental -> rental.getDueDate().isAfter(rental.getRentStartDate().plusDays(7)));
		if (isMemberOverdue) {
			throw new IllegalStateException("회원의 연체 상태로 인해 대출 연장이 불가능합니다.");
		} else if (isReserve) {
			throw new IllegalStateException("예약된 도서로 인해 대출 연장이 불가능합니다.");
		} else if (isMemberPunish) {
			throw new IllegalStateException("회원이 정지 상태로 인해 대출 연장이 불가능합니다.");
		} else if (isAlreadyExtended) {
			throw new IllegalStateException("이미 연장된 도서입니다.");
		}
		rentals.forEach(rental -> {
			rental.setDueDate(rental.getDueDate().plusDays(7));
		});

	}

	@Override
	public MemberBasicDTO getMemberBasicInfo(String mid) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("해당 회원이 존재하지 않습니다."));
		return modelMapper.map(member, MemberBasicDTO.class);
	}

	@Override
	public Page<MemberBorrowHistoryDTO> getMemberBorrowHistory(String mid, Pageable pageable,
			BorrowHistoryRequestDTO borrowHistoryRequestDTO) {
		Specification<Rental> spec = RentalSpecifications.mrsFilter(borrowHistoryRequestDTO, mid);
		Page<Rental> rentalPage = rentalRepository.findAll(spec, pageable);
		return rentalPage.map(rental -> {
			MemberBorrowHistoryDTO dto = modelMapper.map(rental, MemberBorrowHistoryDTO.class);
			dto.setBookTitle(rental.getLibraryBook().getBook().getBookTitle());
			dto.setAuthor(rental.getLibraryBook().getBook().getAuthor());
			dto.setIsbn(rental.getLibraryBook().getBook().getIsbn());
			dto.setRentStartDate(rental.getRentStartDate());
			dto.setDeleted(rental.getLibraryBook().isDeleted());
			dto.setDueDate(rental.getDueDate());
			dto.setReturnDate(rental.getReturnDate());
			dto.setRentId(rental.getRentId());
			dto.setMemberState(rental.getMember().getState());
			dto.setRentalState(rental.getState());
			return dto;
		});
	}

	@Override
	public List<MemberReserveListDTO> getMemberReserveList(String mid) {
		Sort sort = Sort.by(Sort.Direction.DESC, "reserveId");
		List<Reserve> reserves = reserveRepository.findReservesByMemberMidAndState(mid, ReserveState.RESERVED, sort);

		List<Long> libraryBookIds = reserves.stream().map(reserve -> reserve.getLibraryBook().getLibraryBookId())
				.distinct().collect(Collectors.toList());

		Map<Long, List<Rental>> rentalsByLibraryBookId = rentalRepository.findByLibraryBookIdIn(libraryBookIds).stream()
				.collect(Collectors.groupingBy(rental -> rental.getLibraryBook().getLibraryBookId()));

		Map<Long, List<Reserve>> reservesByLibraryBookId = reserveRepository
				.findReservedByLibraryBookIdIn(libraryBookIds).stream()
				.collect(Collectors.groupingBy(reserve -> reserve.getLibraryBook().getLibraryBookId()));

		return reserves.stream().map(reserve -> {
			MemberReserveListDTO dto = modelMapper.map(reserve, MemberReserveListDTO.class);
			dto.setBookTitle(reserve.getLibraryBook().getBook().getBookTitle());
			dto.setAuthor(reserve.getLibraryBook().getBook().getAuthor());
			dto.setIsbn(reserve.getLibraryBook().getBook().getIsbn());
			dto.setReserveDate(reserve.getReserveDate());
			dto.setUnmanned(reserve.isUnmanned());
			dto.setReserveId(reserve.getReserveId());

			Long libraryBookId = reserve.getLibraryBook().getLibraryBookId();
			List<Rental> rentals = rentalsByLibraryBookId.getOrDefault(libraryBookId, Collections.emptyList());
			List<Reserve> allReserves = reservesByLibraryBookId.getOrDefault(libraryBookId, Collections.emptyList());

			dto.setDueDate(rentals.stream().map(Rental::getDueDate).filter(Objects::nonNull)
					.max(Comparator.naturalOrder()).orElse(null));

			List<Reserve> sortedReserves = allReserves.stream()
					.filter(r -> r.getState() == ReserveState.RESERVED && !r.isUnmanned())
					.sorted(Comparator.comparing(Reserve::getReserveDate)).collect(Collectors.toList());
			dto.setReserveRank(sortedReserves.indexOf(reserve) + 1);

			dto.setReturned(rentals.stream().anyMatch(r -> r.getState() == RentalState.RETURNED));

			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public void cancelReserve(Long reserveId) {
		Reserve reserve = reserveRepository.findById(reserveId)
				.orElseThrow(() -> new IllegalArgumentException("해당 예약이 존재하지 않습니다."));
		if (reserve.getState() != ReserveState.RESERVED) {
			throw new IllegalStateException("이미 취소된 예약입니다.");
		}
		reserve.setState(ReserveState.CANCELED);
	}

	@Override
	public List<String> getMemberBorrowedBookIsbns(String mid) {
		return memberRepository.find40borrowedIsbn(mid);

	}

	@Override
	public Map<String, Map<String, Integer>> getMemberYearBorrowList(String mid) {
		LocalDate today = LocalDate.now();
		LocalDate tenYearsAgo = LocalDate.of(today.getYear() - 10, 1, 1);

		List<Rental> borrowList = rentalRepository.findByMemberMidAndRentStartDateBetweenOrderByRentStartDateAsc(mid,
				tenYearsAgo, today);

		Map<String, Map<String, Integer>> monthlyYearlyCounts = new LinkedHashMap<>();
		int startYear = tenYearsAgo.getYear();
		int endYear = today.getYear();

		for (int m = 1; m <= 12; m++) {
			String monthStr = m + "월";
			Map<String, Integer> yearMap = new LinkedHashMap<>();
			for (int y = startYear; y <= endYear; y++) {
				yearMap.put(y + "년", 0);
			}
			monthlyYearlyCounts.put(monthStr, yearMap);
		}

		for (Rental rental : borrowList) {
			LocalDate date = rental.getRentStartDate();
			String monthStr = date.getMonthValue() + "월";
			String yearStr = date.getYear() + "년";

			Map<String, Integer> yearMap = monthlyYearlyCounts.get(monthStr);
			yearMap.put(yearStr, yearMap.get(yearStr) + 1);
		}

		Map<String, Integer> cumulativeYearly = new HashMap<>();
		for (int y = startYear; y <= endYear; y++) {
			cumulativeYearly.put(y + "년", 0);
		}

		for (int m = 1; m <= 12; m++) {
			String monthStr = m + "월";
			Map<String, Integer> yearMap = monthlyYearlyCounts.get(monthStr);

			for (int y = startYear; y <= endYear; y++) {
				String yearStr = y + "년";
				int currentCount = yearMap.get(yearStr);
				int cumulative = cumulativeYearly.get(yearStr) + currentCount;
				cumulativeYearly.put(yearStr, cumulative);
				yearMap.put(yearStr, cumulative);
			}
		}

		return monthlyYearlyCounts;
	}

	@Override
	public MemberRecoBookDTO getMemberBorrowedBookIsbnForReco(String mid) {
		List<String> isbns = memberRepository.find5borrowedIsbn(mid);
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		MemberRecoBookDTO recoBookDTO = new MemberRecoBookDTO();
		recoBookDTO.setIsbns(isbns);
		if (member.getGender().equals("남")) {
			recoBookDTO.setGender(0L);
		} else {
			recoBookDTO.setGender(1L);
		}
		LocalDate birthDate = member.getBirthDate();

		int age = Period.between(birthDate, LocalDate.now()).getYears();
		Long ageGroup = (long) ((age / 10) * 10);
		recoBookDTO.setAge(ageGroup);

		return recoBookDTO;
	}

	@Override
	public MemberPhoneDTO getMemberPhone(String mid) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		String phone = member.getPhone();
		MemberPhoneDTO dto = new MemberPhoneDTO();
		dto.setPhoneList(Arrays.asList(phone.split("-")));

		return dto;
	}

	@Override
	public List<MemberWishBookListDTO> getMemberWishBookList(String mid, int year) {
		Specification<WishBook> spac = WishBookSpecifications.wbFilter(year, mid, WishBookState.CANCELED);
		Sort sort = Sort.by(Sort.Direction.DESC, "wishNo");
		List<WishBook> wishBooks = wishBookRepository.findAll(spac, sort);
		return wishBooks.stream().map(wishBook -> {
			MemberWishBookListDTO dto = modelMapper.map(wishBook, MemberWishBookListDTO.class);
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public void cancelWishBook(Long wishId, String mid) {
		WishBook wishBook = wishBookRepository.findByWishNoAndMemberMid(wishId, mid)
				.orElseThrow(() -> new IllegalArgumentException("해당 내역이 존재하지 않습니다."));
		if (wishBook.getState() == WishBookState.CANCELED) {
			throw new IllegalStateException("이미 취소된 내역입니다.");
		}
		if (wishBook.getState() == WishBookState.REJECTED) {
			throw new IllegalStateException("이미 거절된 내역입니다.");
		}
		if (wishBook.getState() == WishBookState.ACCEPTED) {
			throw new IllegalStateException("이미 수락된 내역입니다.");
		}
		wishBook.setState(WishBookState.CANCELED);
	}

	@Override
	public MemberEbookDetailDTO getMemberEbookDetail(Long ebookId, String mid) {
		Ebook ebook = ebookRepository.findById(ebookId)
				.orElseThrow(() -> new IllegalArgumentException("해당 EBOOK이 존재하지 않습니다."));
		MemberEbookDetailDTO dto = modelMapper.map(ebook, MemberEbookDetailDTO.class);
		return dto;
	}

	@Override
	public void addInterestedBook(String mid, AddInterestedBookDTO addInterestedBookDto) {
		List<Long> libraryBookIds = addInterestedBookDto.getLibraryBookIds();
		List<LibraryBook> libraryBooks = libraryBookRepository.findByLibraryBookIdIn(libraryBookIds);
		Member member = memberRepository.findById(mid).orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));
		List<InterestedBook> existingInterestedBooks = interestedBookRepository
				.findByLibraryBookInAndMemberMid(libraryBooks, mid);
		if (!existingInterestedBooks.isEmpty()) {
			String duplicatedTitles = existingInterestedBooks.stream()
					.map(ib -> ib.getLibraryBook().getBook().getBookTitle()).collect(Collectors.joining(", "));
			throw new IllegalStateException("이미 관심 도서로 등록된 책이 포함되어 있습니다: " + duplicatedTitles);
		}
		List<InterestedBook> interestedBooks = libraryBooks.stream().map(libraryBook -> {
			InterestedBook ib = new InterestedBook();
			ib.setLibraryBook(libraryBook);
			ib.setMember(member);
			return ib;
		}).collect(Collectors.toList());

		interestedBookRepository.saveAll(interestedBooks);
	}

	@Override
	public Page<InterestedBookResponseDTO> getInterestedBookList(Pageable pageable,
			InterestedBookRequestDTO interestedBookRequestDto, String mid) {
		Specification<InterestedBook> spec = InterestedBookSpecifications.ibFilter(interestedBookRequestDto, mid);
		Page<InterestedBook> interestedBooks = interestedBookRepository.findAll(spec, pageable);

		List<Long> libraryBookIds = interestedBooks.getContent().stream()
				.map(ib -> ib.getLibraryBook().getLibraryBookId()).collect(Collectors.toList());
		Map<Long, BookStatusInfoDTO> statusMap = getBookStatusMap(libraryBookIds);

		return interestedBooks.map(interestedBook -> createInterestedBookResponseDTO(interestedBook,
				statusMap.get(interestedBook.getLibraryBook().getLibraryBookId())));
	}

	@Override
	public void deleteInterestedBook(InteresdtedBookDeleteDTO interesdtedBookDeleteDto, String mid) {

		List<Long> interestedBookIds = interesdtedBookDeleteDto.getIbIds();
		List<InterestedBook> interestedBooks = interestedBookRepository.findByIbIdIn(interestedBookIds);
		Map<Long, InterestedBook> interestedBookMap = interestedBooks.stream()
				.collect(Collectors.toMap(InterestedBook::getIbId, interestedBook -> interestedBook));
		for (Long ibId : interestedBookIds) {
			InterestedBook interestedBook = interestedBookMap.get(ibId);
			if (interestedBook == null) {
				throw new IllegalStateException("해당 관심 도서 정보를 찾을 수 없습니다.");
			}
			if (!interestedBook.getMember().getMid().equals(mid)) {
				throw new IllegalStateException("해당 관심 도서를 삭제할 권한이 없습니다.");
			}
		}
		interestedBookRepository.deleteAll(interestedBooks);

	}

	@Override
	public Page<EbookMemberResponseDTO> getMyEbookList(Pageable pageable, EbookMemberRequestDTO dto, String mid) {
		LOGGER.info("Fetching eBooks for member: {}", mid);
		Specification<Ebook> spec = EbookSpecifications.meFilter(dto, mid);
		LOGGER.info("Specification created: {}", spec);
		Page<Ebook> ebookPage = ebookRepository.findAll(spec, pageable);
		LOGGER.info("Ebook page fetched: {}", ebookPage);

		return ebookPage.map(ebook -> {
			EbookMemberResponseDTO responseDto = modelMapper.map(ebook, EbookMemberResponseDTO.class);
			responseDto.setLastReadTime(ebook.getReadingProgressList().stream()
					.filter(progress -> progress.getMember().getMid().equals(mid)
							&& progress.getEbook().getEbookId().equals(ebook.getEbookId()))
					.map(EbookReadingProgress::getLastReadTime).findFirst().orElse(null));
			return responseDto;
		});
	}

	@Override
	public void deleteMyEbook(EbookMemberDeleteDTO dto, String mid) {
		List<Long> ebookIds = dto.getEbookIds();
		List<Highlight> highlights = highlightRepository.findByMemberMidAndEbookEbookIdIn(mid, ebookIds);
		List<EbookReadingProgress> readingProgressList = ebookReadingProgressRepository
				.findByMemberMidAndEbookEbookIdIn(mid, ebookIds);
		highlightRepository.deleteAll(highlights);
		ebookReadingProgressRepository.deleteAll(readingProgressList);

	}

	@Override
	public ChatMemberBorrowResponseDTO getChatMemberBorrowState(String mid) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다."));
		List<Reserve> reserves = reserveRepository.findActiveReserves(mid, ReserveState.RESERVED);
		List<Rental> rentals = rentalRepository.findActiveBorrowedRentals(mid, RentalState.BORROWED);

		ChatMemberBorrowResponseDTO dto = new ChatMemberBorrowResponseDTO();
		dto.setBorrowCount((long) rentals.size());
		dto.setReservedCount(reserves.stream()
				.filter(reserve -> reserve.getState() == ReserveState.RESERVED && !reserve.isUnmanned()).count());
		dto.setUnmannedCount(reserves.stream()
				.filter(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned()).count());
		dto.setCanBorrowCount(5L - dto.getBorrowCount() - dto.getReservedCount() - dto.getUnmannedCount());
		dto.setCanReserveCount(dto.getCanBorrowCount() < 2 ? 0L : 2 - dto.getReservedCount());
		dto.setState(member.getState());
		dto.setOverdueCount(rentals.stream().filter(
				rental -> rental.getState() == RentalState.BORROWED && rental.getDueDate().isBefore(LocalDate.now()))
				.count());

		return dto;

	}

	@Override
	public ChatMemberReservationResponseDTO getChatMemberReservationState(String mid) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다."));
		Sort sort = Sort.by(Sort.Direction.DESC, "reserveId");
		List<Reserve> reserves = reserveRepository.findReservesByMemberMidAndState(mid, ReserveState.RESERVED, sort);
		List<Rental> rentals = rentalRepository.findActiveBorrowedRentals(mid, RentalState.BORROWED);

		List<ChatMemberReservationBookDTO> dto = reserves.stream().map(reserve -> {
			ChatMemberReservationBookDTO d = modelMapper.map(reserve, ChatMemberReservationBookDTO.class);
			d.setBookTitle(reserve.getLibraryBook().getBook().getBookTitle());
			d.setAuthor(reserve.getLibraryBook().getBook().getAuthor());
			d.setUnmanned(reserve.isUnmanned());
			d.setRank(reserve.getLibraryBook().getReserves().stream()
					.filter(r -> r.getState() == ReserveState.RESERVED && !r.isUnmanned())
					.sorted((r1, r2) -> r1.getReserveDate().compareTo(r2.getReserveDate())).collect(Collectors.toList())
					.indexOf(reserve) + 1);
			d.setReturned(
					reserve.getLibraryBook().getRentals().stream().anyMatch(r -> r.getState() == RentalState.RETURNED));
			return d;
		}).collect(Collectors.toList());

		Long borrowCount = (long) rentals.size();
		Long unmannedCount = reserves.stream()
				.filter(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned()).count();

		ChatMemberReservationResponseDTO responseDto = new ChatMemberReservationResponseDTO();
		responseDto.setReservationBooks(dto);
		responseDto.setState(member.getState());
		responseDto.setReservedCount(reserves.stream()
				.filter(reserve -> reserve.getState() == ReserveState.RESERVED && !reserve.isUnmanned()).count());

		responseDto.setCanBorrowCount(5L - borrowCount - responseDto.getReservedCount() - unmannedCount);
		responseDto.setCanReserveCount(responseDto.getCanBorrowCount() < 2 ? 0L : 2 - responseDto.getReservedCount());
		responseDto.setOverdueCount(rentals.stream().filter(
				rental -> rental.getState() == RentalState.BORROWED && rental.getDueDate().isBefore(LocalDate.now()))
				.count());

		return responseDto;

	}

	@Override
	public List<GenderCountDTO> getGenderCount() {
		return memberRepository.countByGender();
	}

	@Override
	public List<AgeCountDTO> getAgeCount() {
		List<Object[]> groupCount = memberRepository.countByAgeGroup();
		List<AgeCountDTO> countDTO = new ArrayList<>();
		for (Object[] group : groupCount) {
			String ageGroup = (String) group[0];
			Number countNumber = (Number) group[1];
			Long count = countNumber.longValue();
			countDTO.add(new AgeCountDTO(ageGroup, count));
		}
		return countDTO;
	}

	@Override
	public List<RegionCountDTO> getRegionCount() {
		List<Object[]> groupCount = memberRepository.countByRegionGroup();
		List<RegionCountDTO> countDTO = new ArrayList<>();
		for (Object[] group : groupCount) {
			String regionGroup = (String) group[0];
			Number countNumber = (Number) group[1];
			Long count = countNumber.longValue();
			countDTO.add(new RegionCountDTO(regionGroup, count));
		}
		return countDTO;
	}

	@Override
	public void sendBookReturnNotification() {

		LocalDate today = LocalDate.now();
		Map<String, String> result = memberRepository.findPhonesWithBookCountByDueDate(today).stream()
				.collect(Collectors.toMap(row -> (String) row[0], row -> {
					Long count = (Long) row[1];
					String name = (String) row[2];
					return name + "님, 안녕하세요. 대구도서관입니다. 현재 반납 기한이 오늘인 도서 " + count + "권이 확인되었습니다. 잊지 말고 반납해 주세요!";
				}));
		SmsReturnRequestDTO smsBookRequestDTO = new SmsReturnRequestDTO();
		smsBookRequestDTO.setPhoneMap(result);
		smsService.sendReturnDueApi(smsBookRequestDTO);

	}
	
	// 시설, 프로그램 신청 내역 삭제
	@Override
	public void deletePlaceProgram(String mid) {
		// 시설 신청 내역 삭제
		placeRepository.deleteByMember_Mid(mid);
		
		// 프로그램 신청 내역 삭제
		programUseRepository.deleteByMember_Mid(mid);
		
	}

	
@Override	
public boolean isBorrowedMember(String mid) {
	Member member = memberRepository.findById(mid).orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다."));

	// 대출 중인 도서가 있는지 확인
	boolean hasBorrowedBooks = rentalRepository.existsByMemberAndState(member, RentalState.BORROWED);

	return hasBorrowedBooks;
}

@Override
public void cancelAllReservesForMember(String mid) {
	Member member = memberRepository.findById(mid).orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다."));

	List<Reserve> reserves = reserveRepository.findByMemberAndState(member, ReserveState.RESERVED);

	
	reserves.forEach(reserve -> reserve.setState(ReserveState.CANCELED));

}


//////////////////////////////////////////////

	private Map<Long, BookStatusInfoDTO> getBookStatusMap(List<Long> libraryBookIds) {
		if (libraryBookIds.isEmpty()) {
			return Collections.emptyMap();
		}

		// 예약 정보 조회
		List<ReserveStatusDTO> reserveStatuses = reserveRepository.findReserveStatusByLibraryBookIds(libraryBookIds);

		// 대여 정보 조회
		List<RentalStatusDTO> rentalStatuses = rentalRepository.findRentalStatusByLibraryBookIds(libraryBookIds);

		Map<Long, BookStatusInfoDTO> statusMap = new HashMap<>();

		// 예약 정보 처리
		Map<Long, List<ReserveStatusDTO>> reserveMap = reserveStatuses.stream()
				.collect(Collectors.groupingBy(ReserveStatusDTO::getLibraryBookId));

		// 대여 정보 처리
		Map<Long, Boolean> rentalMap = rentalStatuses.stream()
				.collect(Collectors.toMap(RentalStatusDTO::getLibraryBookId, RentalStatusDTO::isBorrowed
//            (existing, replacement) -> existing || replacement
				));

		// 최종 상태 정보 생성
		for (Long libraryBookId : libraryBookIds) {
			List<ReserveStatusDTO> reserves = reserveMap.getOrDefault(libraryBookId, Collections.emptyList());
			boolean isBorrowed = rentalMap.getOrDefault(libraryBookId, false);

			boolean isReserved = reserves.stream().anyMatch(r -> !r.isUnmanned());
			boolean isUnmanned = reserves.stream().anyMatch(ReserveStatusDTO::isUnmanned);
			long reserveCount = reserves.stream().filter(r -> !r.isUnmanned()).count();

			statusMap.put(libraryBookId, new BookStatusInfoDTO(isReserved, isUnmanned, isBorrowed, reserveCount));
		}

		return statusMap;
	}

	private InterestedBookResponseDTO createInterestedBookResponseDTO(InterestedBook interestedBook,
			BookStatusInfoDTO statusInfoDTO) {
		InterestedBookResponseDTO dto = new InterestedBookResponseDTO();

		modelMapper.map(interestedBook.getLibraryBook(), dto);
		modelMapper.map(interestedBook.getLibraryBook().getBook(), dto);
		modelMapper.map(interestedBook, dto);

		dto.setReserved(statusInfoDTO.isReserved());
		dto.setUnmanned(statusInfoDTO.isUnmanned());
		dto.setBorrowed(statusInfoDTO.isBorrowed());
		dto.setReserveCount(statusInfoDTO.getReserveCount());

		return dto;
	}
}
