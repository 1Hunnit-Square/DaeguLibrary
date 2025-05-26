package com.dglib.service.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.dto.member.RegMemberDTO;

public interface MemberService {
	
	Page<MemberSeaerchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	
	void registerMember(RegMemberDTO regMemberDTO);
	
	boolean existByPhone(String phone);
	
	void executeOverdueCheck();
	
	boolean isLastSuccessOverdueCheckDateToday();
	

}
