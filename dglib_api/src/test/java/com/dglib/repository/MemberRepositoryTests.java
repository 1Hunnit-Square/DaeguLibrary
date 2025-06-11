package com.dglib.repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.member.MemberRepository;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class MemberRepositoryTests {

@Autowired
private MemberRepository memberRepository;

@Autowired
private PasswordEncoder passwordEncoder;


@Test
public void insertMember() {
	Member member1 = Member.builder()
			.mid("user1")
			.pw(passwordEncoder.encode("1111"))
			.name("홍길동")
			.email("user1@test.com")
			.gender("남")
			.phone("010-1111-1111")
			.birthDate(LocalDate.parse("1890-01-20"))
			.addr("대전광역시 서구")
			.checkEmail(false)
			.checkSms(false)
			.mno(setMno())
			.role(MemberRole.USER)
			.state(MemberState.NORMAL)
			.build();
	
	memberRepository.save(member1);
	
	Member member2 = Member.builder()
			.mid("user2")
			.pw(passwordEncoder.encode("1111"))
			.name("안유진")
			.email("user2@test.com")
			.gender("여")
			.phone("010-2222-1111")
			.birthDate(LocalDate.parse("2000-01-20"))
			.addr("대전광역시 유성구")
			.checkEmail(false)
			.checkSms(false)
			.mno(setMno())
			.role(MemberRole.MANAGER)
			.state(MemberState.NORMAL)
			.build();
	
	
	memberRepository.save(member2);
	
}

@Test
@Disabled
public void insertMember2() {
	Member member3 = Member.builder()
			.mid("user3")
			.pw(passwordEncoder.encode("1111"))
			.name("김유신")
			.email("user3@test.com")
			.gender("남")
			.phone("010-2222-1122")
			.birthDate(LocalDate.parse("1770-01-20"))
			.addr("대전광역시 동구")
			.checkEmail(false)
			.checkSms(false)
			.mno(setMno())
			.role(MemberRole.ADMIN)
			.state(MemberState.NORMAL)
			.build();
	
	
	memberRepository.save(member3);

}


	public String setMno () {
		String result = null;
		LocalDate today = LocalDate.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMdd");
		String fDate = today.format(formatter);
		
		Long newMno = memberRepository.countByMnoLike(fDate+"____");
		result = fDate + String.format("%04d", newMno+1);
		
		return result;
	}


}
