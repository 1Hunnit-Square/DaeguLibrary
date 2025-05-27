package com.dglib.service.member;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
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
	
	@Override
	public Page<MemberSeaerchByMnoDTO> searchByMno(String mno, Pageable pageable) {
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
	
	

}
