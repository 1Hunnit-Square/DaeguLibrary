package com.dglib.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.service.member.MemberService;
import com.dglib.service.sms.SmsService;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class MemberBorrowCheckTest {
	
	@Autowired
	private MemberService memberService;
	
//	@Test
//	public void borrowcheckTest() {
//		String mid = "kdh3502";
//		boolean isborrowed = memberService.isBorrowedMember(mid);
//		log.info(isborrowed);
//	}
	
	@Test
	public void cancelTest() {
		String mid = "kdh3502";
		memberService.cancelAllReservesForMember(mid);
	}
	

}
