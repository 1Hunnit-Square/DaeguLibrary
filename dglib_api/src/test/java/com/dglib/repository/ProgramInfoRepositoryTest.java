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

import com.dglib.entity.program.ProgramInfo;
import com.dglib.repository.program.ProgramInfoRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
public class ProgramInfoRepositoryTest {

    @Autowired
    ProgramInfoRepository programInfoRepository;

//    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("프로그램 정보 등록")
    public void applyProgramInfoTest() {
        ProgramInfo programInfo = ProgramInfo.builder()
                .progName("프로그램 생성1")
                .teachName("김선생")
                .applyStartAt(LocalDateTime.of(2025, 5, 1, 14, 0))
                .applyEndAt(LocalDateTime.of(2025, 5, 8, 18, 0))
                .daysOfWeek(List.of(DayOfWeek.MONDAY.getValue(), DayOfWeek.WEDNESDAY.getValue(), DayOfWeek.FRIDAY.getValue()))
                .room("장소")
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 6, 8))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(17, 0))
                .target("누구나")
                .capacity(10)
                .originalName("야외독서 피크닉 강의계획서")
                .filePath("/programs/picnic")
                .build();

        ProgramInfo saved = programInfoRepository.save(programInfo);
        System.out.println("프로그램 요일: " + saved.getDaysOfWeek());
    }

//    @Test
    @Transactional
    @DisplayName("프로그램 정보 조회")
    public void findProgramInfoTest() {
        // 테스트용 데이터 저장
        ProgramInfo programInfo = ProgramInfo.builder()
                .progName("조회 테스트")
                .teachName("홍선생")
                .applyStartAt(LocalDateTime.of(2025, 5, 2, 14, 0))
                .applyEndAt(LocalDateTime.of(2025, 5, 9, 18, 0))
                .daysOfWeek(List.of(DayOfWeek.MONDAY.getValue(), DayOfWeek.WEDNESDAY.getValue(), DayOfWeek.FRIDAY.getValue()))
                .room("강의실 2")
                .startDate(LocalDate.of(2025, 6, 2))
                .endDate(LocalDate.of(2025, 6, 9))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .target("성인")
                .capacity(20)
                .originalName("조회계획서.pdf")
                .filePath("/programs/query")
                .build();

        ProgramInfo saved = programInfoRepository.save(programInfo);
        Long id = saved.getProgNo();

        ProgramInfo find = programInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로그램 정보를 찾을 수 없습니다."));

        System.out.println("조회한 프로그램명: " + find.getProgName());
        System.out.println("조회한 요일: " + find.getDaysOfWeek());
    }

//    @Test
    @DisplayName("프로그램 정보 수정")
    public void updateProgramInfoTest() {
        ProgramInfo programInfo = ProgramInfo.builder()
                .progName("수정 전 프로그램")
                .teachName("최선생")
                .applyStartAt(LocalDateTime.of(2025, 5, 3, 14, 0))
                .applyEndAt(LocalDateTime.of(2025, 5, 10, 18, 0))
                .daysOfWeek(List.of(DayOfWeek.MONDAY.getValue(), DayOfWeek.WEDNESDAY.getValue(), DayOfWeek.FRIDAY.getValue()))
                .room("로비")
                .startDate(LocalDate.of(2025, 6, 3))
                .endDate(LocalDate.of(2025, 6, 10))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .target("아동")
                .capacity(25)
                .originalName("수정계획서.docx")
                .filePath("/programs/update")
                .build();

        ProgramInfo saved = programInfoRepository.save(programInfo);

        saved.setProgName("수정된 프로그램명");
        saved.setRoom("수정된 강의실");

        ProgramInfo updated = programInfoRepository.save(saved);

        System.out.println("수정된 프로그램명: " + updated.getProgName());
        System.out.println("수정된 장소: " + updated.getRoom());
    }
    
    @Test
    @DisplayName("프로그램 정보 삭제")
    public void deleteProgramInfoTest() {
        ProgramInfo programInfo = ProgramInfo.builder()
                .progName("삭제 대상 프로그램")
                .teachName("이선생")
                .applyStartAt(LocalDateTime.of(2025, 5, 4, 10, 0))
                .applyEndAt(LocalDateTime.of(2025, 5, 11, 18, 0))
                .daysOfWeek(List.of(DayOfWeek.MONDAY.getValue(), DayOfWeek.WEDNESDAY.getValue(), DayOfWeek.FRIDAY.getValue()))
                .room("강의실 1")
                .startDate(LocalDate.of(2025, 6, 4))
                .endDate(LocalDate.of(2025, 6, 11))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .target("성인")
                .capacity(20)
                .originalName("삭제계획서.docx")
                .filePath("/programs/delete")
                .build();

        ProgramInfo saved = programInfoRepository.save(programInfo);
        Long progNo = saved.getProgNo();

        programInfoRepository.deleteById(progNo);

        boolean exists = programInfoRepository.findById(progNo).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }

}
