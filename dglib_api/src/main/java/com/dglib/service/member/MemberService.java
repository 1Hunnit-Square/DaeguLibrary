package com.dglib.service.member;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.RegMemberDTO;

public interface MemberService {
	
	Page<MemberSearchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	
	void registerMember(RegMemberDTO regMemberDTO);
	
	boolean existByPhone(String phone);
	
	void executeOverdueCheck();
	
	boolean isLastSuccessOverdueCheckDateToday();
	
	List<MemberBorrowNowListDTO> getMemberBorrowNowList(String mid);
	
	void extendMemberBorrow(List<Long> rentIds);
	

}
