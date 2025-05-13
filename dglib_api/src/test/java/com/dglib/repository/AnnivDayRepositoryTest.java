package com.dglib.repository;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.days.AnnivDay;
import com.dglib.repository.days.AnnivDayRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class AnnivDayRepositoryTest {

    @Autowired
    private AnnivDayRepository eventDayRepository;

//    @Test
    @DisplayName("기념일 등록")
    public void createEventDay() {
        AnnivDay anniv = AnnivDay.builder()
                .annivDate(LocalDate.of(2025, 5, 20))
                .annivType("기념일")
                .annivName("도서관 창립일")
                .build();

        AnnivDay saved = eventDayRepository.save(anniv);
        System.out.println("행사 ID: " + saved.getAnnivNo());
    }

//    @Test
    @DisplayName("기념일 조회")
    public void readEventDay() {
        AnnivDay saved = eventDayRepository.save(
                AnnivDay.builder()
                        .annivDate(LocalDate.of(2025, 6, 15))
                        .annivType("기념일")
                        .annivName("세계 도서의 날")
                        .build()
        );

        AnnivDay found = eventDayRepository.findById(saved.getAnnivNo()).orElse(null);
        if (found != null) {
            System.out.println("조회된 기념일명: " + found.getAnnivName());
        }
    }

//    @Test
    @DisplayName("기념일 수정")
    public void updateEventDay() {
        AnnivDay saved = eventDayRepository.save(
                AnnivDay.builder()
                        .annivDate(LocalDate.of(2025, 7, 10))
                        .annivType("기념일")
                        .annivName("수정 전 일정")
                        .build()
        );

        saved.setAnnivName("수정 후 일정");
        saved.setAnnivType("임시공휴일");
        eventDayRepository.save(saved);
    }

    @Test
    @DisplayName("행사 삭제")
    public void deleteEventDay() {
        AnnivDay saved = eventDayRepository.save(
                AnnivDay.builder()
                        .annivDate(LocalDate.of(2025, 8, 5))
                        .annivType("기념일")
                        .annivName("세계 도서의 날")
                        .build()
        );

        Long id = saved.getAnnivNo();
        eventDayRepository.deleteById(id);

        boolean exists = eventDayRepository.findById(id).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }
}
