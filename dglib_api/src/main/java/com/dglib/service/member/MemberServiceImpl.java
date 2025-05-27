package com.dglib.service.member;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
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

import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.book.RentalRepository;
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
	
	

}
