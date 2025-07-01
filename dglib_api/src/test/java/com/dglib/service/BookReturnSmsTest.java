package com.dglib.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.service.member.MemberService;

@SpringBootTest
public class BookReturnSmsTest {
	
	@Autowired
	private MemberService memberService;
	
	
	@Test
	public void testSendReturnSms() {
		
		memberService.sendBookReturnNotification();

		
	}

}
