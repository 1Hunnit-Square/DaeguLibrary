package com.dglib.service.member;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.member.BorrowHistoryRequestDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
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
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.book.WishBook;
import com.dglib.entity.book.WishBookState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.book.RentalSpecifications;
import com.dglib.repository.book.ReserveRepository;
import com.dglib.repository.book.WishBookRepository;
import com.dglib.repository.book.WishBookSpecifications;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.member.MemberSpecifications;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class MemberServiceImpl implements MemberService {
	
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final PasswordEncoder passwordEncoder;
	private final RentalRepository rentalRepository;
	private final ReserveRepository reserveRepository;
	private final WishBookRepository wishBookRepository;
	private final Logger LOGGER = LoggerFactory.getLogger(MemberServiceImpl.class);
	private LocalDate lastSuccessOverdueCheckDate;
	
	
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
		return memberRepository.existsByPhone(phone);
	}
	
	@Override
	public Page<MemberListDTO> findAll(MemberSearchDTO searchDTO, Pageable pageable) {
		Specification<Member> spec = MemberSpecifications.fromDTO(searchDTO);
		Page<Member> memberList = memberRepository.findAll(spec, pageable);
		
		AtomicLong index = new AtomicLong(1);
		
		Page<MemberListDTO> result = memberList.map(member -> {
			MemberListDTO memberListDTO = new MemberListDTO();
			modelMapper.map(member, memberListDTO);
			memberListDTO.setIndex(index.getAndIncrement());
			memberListDTO.setPenaltyDays(calcPenaltyDays(member.getPenaltyDate()));
				
			return memberListDTO;	
		});
		
		return result;
	}
	
	
	@Override
	public void manageMember(MemberManageDTO memberManageDTO) {
		Member member = memberRepository.findById(memberManageDTO.getMid()).orElseThrow(() -> new IllegalArgumentException("User not found"));
		member.setRole(memberManageDTO.getRole());
		member.setState(memberManageDTO.getState());
		member.setPenaltyDate(memberManageDTO.getPenaltyDate());
		memberRepository.save(member);
	}
	
	@Override
	public String findId(MemberFindIdDTO memberFindIdDTO) {
		Member member = memberRepository.findByNameAndBirthDateAndPhone(memberFindIdDTO.getName(), memberFindIdDTO.getBirthDate(), memberFindIdDTO.getPhone())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		return member.getMid();
	}
	
	@Override
	public boolean existAccount(MemberFindAccountDTO memberFindAccountDTO) {
		return memberRepository.existsByMidAndBirthDateAndPhone(memberFindAccountDTO.getMid(), memberFindAccountDTO.getBirthDate(), memberFindAccountDTO.getPhone());
	}
	
	@Override
	public void modPwMember(String mid, String pw) {
		Member member = memberRepository.findById(mid).orElseThrow(() -> new IllegalArgumentException("User not found"));
		member.setPw(passwordEncoder.encode(pw));
		memberRepository.save(member);
	}
	
	@Override
	public MemberInfoDTO findMemberInfo(String mid, String pw) {
		Member member = memberRepository.findById(mid).orElseThrow(() -> new IllegalArgumentException("User not found"));
		boolean valid = passwordEncoder.matches(pw, member.getPw());
		if(!valid) {
			throw new IllegalArgumentException("Password Different");
		}
		return modelMapper.map(member, MemberInfoDTO.class);
	}
	
	@Override
	public void modifyMember(String mid, ModMemberDTO modMemberDTO) {
		if(!mid.equals(modMemberDTO.getMid())) {
			throw new IllegalArgumentException("ID Different");
		}
		Member member = memberRepository.findById(mid).orElseThrow(() -> new IllegalArgumentException("User not found"));
		String oldPw = member.getPw();
		modelMapper.map(modMemberDTO, member);
		if(modMemberDTO.getPw() != null) {
			member.setPw(passwordEncoder.encode(modMemberDTO.getPw()));
		} else {
			member.setPw(oldPw);
		}
		memberRepository.save(member);
	}
	
	public String setMno () {
		String result = null;
		LocalDate today = LocalDate.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMdd");
		String fDate = today.format(formatter);
		
		Long newMno = memberRepository.countByMnoLike(fDate+"____");
		result = fDate + String.format("%04d", newMno+1);
		
		return result;
	}
	

	@Override
	public void executeOverdueCheck() {
        checkOverdue();
        lastSuccessOverdueCheckDate = LocalDate.now();
    }
	
	
	public int calcPenaltyDays(LocalDate date) {
		if(date == null) {
			return 0;
		}
		LocalDate now = LocalDate.now();
		Period period = Period.between(now, date);
		int days = period.getDays()+1;
		if(days <= 0) {
			days = 0;
		}
		return days;
	}
	
	private void checkOverdue() {
		List<Rental> overdueRentals = rentalRepository.findOverdueRentals(LocalDate.now());
		Map<Member, Long> overdueCountByMember = overdueRentals.stream().filter(rental -> 
		    rental.getMember().getState() != MemberState.PUNISH &&
		    rental.getMember().getState() != MemberState.LEAVE
		).collect(Collectors.groupingBy(Rental::getMember, Collectors.counting()));
		overdueCountByMember.forEach((member, count) -> {
			LOGGER.info("Member ID: {}, Overdue Count: {}", member.getMid(), count);
			member.setPenaltyDate(LocalDate.now().plusDays(count -1));
			member.setState(MemberState.OVERDUE);
			List<Member> releasedMember =  memberRepository.findMembersWithPenaltyDateButNotOverdue();
			releasedMember.forEach(m -> {
				m.setPenaltyDate(null);
				m.setState(MemberState.NORMAL);
			});
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
					.filter(reserve -> reserve.getState() == com.dglib.entity.book.ReserveState.RESERVED && reserve.isUnmanned() == false).count());
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
		boolean isAlreadyExtended = rentals.stream().anyMatch(rental -> rental.getDueDate().isAfter(rental.getRentStartDate().plusDays(7)));
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
	public Page<MemberBorrowHistoryDTO> getMemberBorrowHistory(String mid, Pageable pageable, BorrowHistoryRequestDTO borrowHistoryRequestDTO) {
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
		return reserves.stream().map(reserve -> {
			MemberReserveListDTO dto = modelMapper.map(reserve, MemberReserveListDTO.class);
			dto.setBookTitle(reserve.getLibraryBook().getBook().getBookTitle());
			dto.setAuthor(reserve.getLibraryBook().getBook().getAuthor());
			dto.setIsbn(reserve.getLibraryBook().getBook().getIsbn());
			dto.setReserveDate(reserve.getReserveDate());
			dto.setUnmanned(reserve.isUnmanned());
			dto.setReserveId(reserve.getReserveId());
			dto.setDueDate(reserve.getLibraryBook().getRentals().stream()
					.filter(rental -> rental.getState() == RentalState.BORROWED).map(Rental::getDueDate).findFirst()
					.orElse(null));
			dto.setReserveCount(reserve.getLibraryBook().getReserves().stream()
					.filter(r -> r.getState() == ReserveState.RESERVED && !r.isUnmanned()).count());
			dto.setReturned(reserve.getLibraryBook().getRentals().stream()
					.anyMatch(r -> r.getState() == RentalState.RETURNED));
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

	    List<Rental> borrowList = rentalRepository.findByMemberMidAndRentStartDateBetweenOrderByRentStartDateAsc(mid, tenYearsAgo, today);

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
		if(member.getGender().equals("남")) {
			recoBookDTO.setGender(0L);
		}else {
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
	
	
	

}
