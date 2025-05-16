package com.dglib.service.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.dglib.dto.member.MemberSeaerchByMnoDTO;

public interface MemberService {
	
	Page<MemberSeaerchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	

}
