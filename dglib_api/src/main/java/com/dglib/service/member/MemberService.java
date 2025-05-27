package com.dglib.service.member;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

public interface MemberService {
	
	Page<MemberSearchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	
	void registerMember(RegMemberDTO regMemberDTO);
	
	boolean existByPhone(String phone);
	

	Page<MemberListDTO> findAll(MemberSearchDTO searchDTO, Pageable pageable);
	
	void manageMember(MemberManageDTO memberManageDTO);
	
	String findId(MemberFindIdDTO memberFindIdDTO);
	
	boolean existAccount(MemberFindAccountDTO memberFindAccountDTO);
	
	void modPwMember(String mid, String pw);
	
	MemberInfoDTO findMemberInfo(String mid, String pw);
	
	void modifyMember(String mid, ModMemberDTO modMemberDTO);

	void executeOverdueCheck();
	
	boolean isLastSuccessOverdueCheckDateToday();
	
	List<MemberBorrowNowListDTO> getMemberBorrowNowList(String mid);
	
	void extendMemberBorrow(List<Long> rentIds);


}
