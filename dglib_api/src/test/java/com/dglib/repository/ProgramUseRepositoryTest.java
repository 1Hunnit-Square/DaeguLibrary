package com.dglib.repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.program.ProgramInfo;
import com.dglib.entity.program.ProgramUse;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.program.ProgramInfoRepository;
import com.dglib.repository.program.ProgramUseRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
public class ProgramUseRepositoryTest {

	@Autowired
	ProgramUseRepository programUseRepository;
	
	@Autowired
	ProgramInfoRepository programInfoRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
//	@Test
	@Transactional
	@Rollback(false)
	@DisplayName("프로그램 이용 신청")
	public void applyProgramUseTest() {
		
		  Member member = Member.builder()
	                .mid("0123456789123456")
	                .pw("1234")
	                .name("테스터")
	                .mno("001")
	                .gender("F")
	                .birthDate(LocalDate.of(2000, 1, 1))
	                .phone("01012345678")
	                .addr("대구광역시")
	                .email("tester@example.com")
	                .checkSms(true)
	                .checkEmail(true)
	                .role(MemberRole.USER)
	                .state(MemberState.NORMAL)
	                .build();
	        memberRepository.save(member);
	        
	        ProgramInfo programInfo = ProgramInfo.builder()
	                .progName("테스트 프로그램")
	                .teachName("홍길동")
	                .applyStartAt(LocalDateTime.of(2025, 5, 1, 10, 0))
	                .applyEndAt(LocalDateTime.of(2025, 5, 31, 18, 0))
	                .daysOfWeek(List.of(DayOfWeek.MONDAY.getValue(), DayOfWeek.WEDNESDAY.getValue()))
	                .room("1층 강의실")
	                .startDate(LocalDate.of(2025, 6, 1))
	                .endDate(LocalDate.of(2025, 6, 30))
	                .startTime(LocalTime.of(14, 0))
	                .endTime(LocalTime.of(16, 0))
	                .target("성인")
	                .capacity(20)
	                .originalName("test.pdf")
	                .filePath("/files/test.pdf")
	                .build();
	        programInfoRepository.save(programInfo);
	        
	        ProgramUse programUse = ProgramUse.builder()
				.applyAt(LocalDateTime.of(2025, 5, 12, 10, 35))
				.programInfo(programInfo)
				.member(member)
				.build();
		
		ProgramUse saved = programUseRepository.save(programUse);
		System.out.println("프로그램 신청 시간: " + saved.getApplyAt());
		
		
	}
	
//	@Test
	@Transactional
	@Rollback(false)
	@DisplayName("프로그램 이용내역 조회")
	public void findProgramUseTest() {
		List<ProgramUse> list = programUseRepository.findAll();

	    for (ProgramUse use : list) {
	        System.out.println("신청번호: " + use.getProgUseNo());
	        System.out.println("신청일시: " + use.getApplyAt());
	        System.out.println("프로그램명: " + use.getProgramInfo().getProgName());
	        System.out.println("신청자명: " + use.getMember().getName());
	        System.out.println("--------");
        
        
	    }
	}
	
	@Test
	@Transactional
	@Rollback(false)
    @DisplayName("프로그램 신청내역 삭제")
	public void deleteProgramUseTest() {
	    Long progUseNo = 3L;

	    boolean exists = programUseRepository.existsById(progUseNo);
	    if (exists) {
	        programUseRepository.deleteById(progUseNo);
	        System.out.println("신청번호 " + progUseNo + " 삭제 완료");
	    } else {
	        System.out.println("신청번호 " + progUseNo + " 는 존재하지 않습니다.");
	    }
	} 
	
	
}
