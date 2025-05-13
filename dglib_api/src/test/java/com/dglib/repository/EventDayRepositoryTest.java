package com.dglib.repository;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.list.EventDay;
import com.dglib.repository.list.EventDayRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class EventDayRepositoryTest {

    @Autowired
    private EventDayRepository eventDayRepository;

//    @Test
    @DisplayName("행사 등록")
    public void createEventDay() {
        EventDay event = EventDay.builder()
                .eventDate(LocalDate.of(2025, 5, 20))
                .eventType("문화행사")
                .eventName("도서관 행사")
                .build();

        EventDay saved = eventDayRepository.save(event);
        System.out.println("행사 ID: " + saved.getEventNo());
    }

//    @Test
    @DisplayName("행사 조회")
    public void readEventDay() {
        EventDay saved = eventDayRepository.save(
                EventDay.builder()
                        .eventDate(LocalDate.of(2025, 6, 15))
                        .eventType("강연")
                        .eventName("저자와의 만남")
                        .build()
        );

        EventDay found = eventDayRepository.findById(saved.getEventNo()).orElse(null);
        if (found != null) {
            System.out.println("조회된 행사명: " + found.getEventName());
        }
    }

//    @Test
    @DisplayName("행사 수정")
    public void updateEventDay() {
        EventDay saved = eventDayRepository.save(
                EventDay.builder()
                        .eventDate(LocalDate.of(2025, 7, 10))
                        .eventType("체험행사")
                        .eventName("수정 전 행사")
                        .build()
        );

        saved.setEventName("수정 후 행사");
        saved.setEventType("가족행사");
        eventDayRepository.save(saved);
    }

    @Test
    @DisplayName("행사 삭제")
    public void deleteEventDay() {
        EventDay saved = eventDayRepository.save(
                EventDay.builder()
                        .eventDate(LocalDate.of(2025, 8, 5))
                        .eventType("독서")
                        .eventName("독서감상")
                        .build()
        );

        Long id = saved.getEventNo();
        eventDayRepository.deleteById(id);

        boolean exists = eventDayRepository.findById(id).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }
}
