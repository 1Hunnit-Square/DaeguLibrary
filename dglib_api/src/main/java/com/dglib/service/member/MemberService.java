package com.dglib.service.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.entity.member.Member;

public interface MemberService {
	
	Page<MemberSeaerchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	
	void registerMember(RegMemberDTO regMemberDTO);
	
	boolean existByPhone(String phone);
	
	Page<MemberListDTO> findAll(MemberSearchDTO searchDTO, Pageable pageable);
	
	boolean penaltyCheck (String mid);
	
	void manageMember(MemberManageDTO memberManageDTO);

}
