package com.dglib.service.member;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class MemberServiceImpl implements MemberService {
	
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	
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
		// TODO Auto-generated method stub
		
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
	
	

}
