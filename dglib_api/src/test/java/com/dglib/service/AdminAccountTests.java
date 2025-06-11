package com.dglib.service;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.service.member.MemberService;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class AdminAccountTests {

@Autowired
private MemberService memberService;

private final String ADMIN_ID = "admin";

@Test
public void insertAdmin() {
	
	RegMemberDTO dto = new RegMemberDTO();
	dto.setMid(ADMIN_ID);
	dto.setPw("1111");
	dto.setAddr("대전 서구 둔산동");
	dto.setName("안유진");
	dto.setGender("여");
	dto.setPhone("010");
	dto.setBirthDate(LocalDate.of(1990, 1, 1));
	dto.setCheckEmail(false);
	dto.setCheckSms(false);
	dto.setEmail("admin@test.com");
	

	memberService.registerMember(dto);
	
	MemberManageDTO manageDTO = new MemberManageDTO();
	manageDTO.setMid(ADMIN_ID);
	manageDTO.setRole(MemberRole.ADMIN);
	manageDTO.setState(MemberState.NORMAL);
	manageDTO.setPenaltyDate(null);
	
	memberService.manageMember(manageDTO);

	
}


}

