package com.dglib.repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.program.ProgramBanner;
import com.dglib.entity.program.ProgramInfo;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.program.ProgramBannerRepository;
import com.dglib.repository.program.ProgramInfoRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
public class ProgramBannerRepositoryTest {

	
	@Autowired
	ProgramBannerRepository programBannerRepository;
	
	@Autowired
	ProgramInfoRepository programInfoRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
	
	ProgramInfo testProgram;

    @BeforeEach
    public void setup() {
        Member admin = Member.builder()
                .mid("admin01")
                .pw("1234")
                .name("관리자")
                .mno("9999")
                .gender("F")
                .birthDate(LocalDate.of(1990, 1, 1))
                .phone("01011112222")
                .addr("대구")
                .email("admin@test.com")
                .checkSms(true)
                .checkEmail(true)
                .role(MemberRole.ADMIN)
                .state(MemberState.NORMAL)
                .build();
        memberRepository.save(admin);

        testProgram = ProgramInfo.builder()
                .progName("배너 테스트 프로그램")
                .teachName("강사1")
                .applyStartAt(LocalDateTime.of(2025, 5, 1, 10, 0))
                .applyEndAt(LocalDateTime.of(2025, 5, 31, 18, 0))
                .daysOfWeek(List.of(DayOfWeek.TUESDAY.getValue()))
                .room("1층 강의실")
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 6, 30))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .target("청소년")
                .capacity(30)
                .originalName("file.pdf")
                .filePath("/files/file.pdf")
                .build();
        programInfoRepository.save(testProgram);
    }

//    @Test
    @DisplayName("프로그램 배너 생성")
    @Transactional
    @Rollback(false)
    public void createProgramBanner() {
        ProgramBanner banner = ProgramBanner.builder()
                .imageName("프로그램 배너")
                .imageUrl("/banner/program.jpg")
                .programInfo(testProgram)
                .build();

        programBannerRepository.save(banner);
    }

//    @Test
    @DisplayName("프로그램 배너 조회")
    @Transactional
    @Rollback(false)
    public void findProgramBanner() {
        ProgramBanner banner = ProgramBanner.builder()
                .imageName("조회용 배너")
                .imageUrl("/banner/read.jpg")
                .programInfo(testProgram)
                .build();

        ProgramBanner saved = programBannerRepository.save(banner);
        Long id = saved.getBno();

        programBannerRepository.findById(id).orElseThrow(() -> new RuntimeException("프로그램 신청 내역을 찾을 수 없습니다."));
    }

//    @Test
    @DisplayName("프로그램 배너 수정")
    @Transactional
    @Rollback(false)
    void updateBanner() {
        ProgramBanner banner = ProgramBanner.builder()
                .imageName("수정 전 배너")
                .imageUrl("/banner/before.jpg")
                .programInfo(testProgram)
                .build();

        ProgramBanner saved = programBannerRepository.save(banner);

        saved.setImageName("수정 후 배너");
        saved.setImageUrl("/banner/after.jpg");
        programBannerRepository.save(saved);
        
    }

    @Test
    @DisplayName("프로그램 배너 삭제")
    @Transactional
    @Rollback(false)
    void deleteBanner() {
        ProgramBanner banner = ProgramBanner.builder()
                .imageName("삭제 배너")
                .imageUrl("/banner/delete.jpg")
                .programInfo(testProgram)
                .build();

        ProgramBanner saved = programBannerRepository.save(banner);
        Long id = saved.getBno();

        programBannerRepository.deleteById(id);
        boolean exists = programBannerRepository.findById(id).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }
}
