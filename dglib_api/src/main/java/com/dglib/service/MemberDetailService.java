package com.dglib.service;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dglib.dto.MemberDTO;
import com.dglib.entity.Member;
import com.dglib.repository.MemberRepository;

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
		
		MemberDTO memberDTO = new MemberDTO(member.getMid(), member.getPw(), member.getName(), member.getEmail(), member.getRole().name());
		
		return memberDTO;
	}

}
