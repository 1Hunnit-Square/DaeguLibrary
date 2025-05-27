package com.dglib.service.member;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class MemberServiceImpl implements MemberService {
	
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final PasswordEncoder passwordEncoder;
	private final RentalRepository rentalRepository;
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
	
	

}
