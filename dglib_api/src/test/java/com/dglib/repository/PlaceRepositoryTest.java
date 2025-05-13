package com.dglib.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.place.Place;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.place.PlaceRepository;

@SpringBootTest
public class PlaceRepositoryTest {
	
	@Autowired
	PlaceRepository placeRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
	Member testMember;
	Place testPlace;
	
	@BeforeEach
	public void setup() {
		testMember = Member.builder()
	            .mid("placetester")
	            .pw("12345")
	            .name("테스터")
	            .mno("1")
	            .gender("F")
	            .birthDate(LocalDate.of(2000, 1, 1))
	            .phone("01012345678")
	            .addr("사랑시 고백구 행복동")
	            .email("test@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .role(MemberRole.USER)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(testMember);
	    
	    
	    testPlace = Place.builder()
				.useDate(LocalDate.of(2025,6,7))
				.startTime(LocalTime.of(14, 0))
				.durationTime(2)
				.room("동아리실")
				.people(4)
				.appliedAt(LocalDateTime.now())
				.member(testMember)
				.build();
		
		placeRepository.save(testPlace);
	    
	}
	
	@Test
	@DisplayName("이용시설 신청")
	public void applyPlaceTest() {
		
		testPlace = Place.builder()
				.useDate(LocalDate.of(2025,6,7))
				.startTime(LocalTime.of(14, 0))
				.durationTime(2)
				.room("동아리실")
				.people(4)
				.appliedAt(LocalDateTime.now())
				.member(testMember)
				.build();
		
		Place saved = placeRepository.save(testPlace);
        System.out.println("저장된 신청 번호: " + saved.getPno());
		
	}
	
	@Test
	@DisplayName("이용시설 신청 조회")
	public void findPlaceTest() {
		long pno = testPlace.getPno();
		
		Place find = placeRepository.findById(pno).orElseThrow(() -> new RuntimeException("신청내역이 없음"));
		
		System.out.println("신청 번호: " + find.getPno());
		System.out.println("이용 시작 시간: " + find.getStartTime());
		System.out.println("이용 종료 시간: " + find.getEndTime());
		
	}

	@Test
	@DisplayName("이용시설 신청 삭제")
	public void deletePlaceTest() {
		long pno = testPlace.getPno();
		
		placeRepository.deleteById(pno);
		
		boolean exist = placeRepository.findById(pno).isPresent();
		System.out.println("삭제한 글 번호: " + pno);
		System.out.println("글 삭제 결과: " + exist);
		}
		
		
}
