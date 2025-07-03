package com.dglib.service.member;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dglib.dto.member.MemberDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.member.MemberRepository;
import com.dglib.security.DeletedException;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service @Log4j2
@RequiredArgsConstructor
public class MemberDetailService implements UserDetailsService {
	
	private final MemberRepository memberRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Optional<Member> optionalMember = memberRepository.findById(username);
		
		Member member = optionalMember.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		
		if(member.getState() == MemberState.LEAVE)
			throw new DeletedException("LEAVE MEMBER");
		
		MemberDTO memberDTO = new MemberDTO(member.getMid(), member.getPw(), member.getName(), member.getMno(), member.getRole().name());
		
		return memberDTO;
	}
	
	public UserDetails loadUserByKakao(String kakaoEmail) throws UsernameNotFoundException {
		Optional<Member> optionalMember = memberRepository.findByKakao(kakaoEmail);
		
		Member member = optionalMember.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		
		MemberDTO memberDTO = new MemberDTO(member.getMid(), member.getPw(), member.getName(), member.getMno(), member.getRole().name());
		
		return memberDTO;
	}
	


}
