package com.dglib.repository;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.days.ClosedDay;
import com.dglib.repository.days.ClosedDayRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class ClosedDayRepositoryTest {

	
	@Autowired
	private ClosedDayRepository closedDayRepository;
	
//	@Test
	@DisplayName("휴관일 등록")
	public void createClosedDay() {
		ClosedDay closed = ClosedDay.builder()
				.closedDate(LocalDate.of(2025, 5, 1))
				.isClosed(true)
				.build();
		
		ClosedDay saved = closedDayRepository.save(closed);
		System.out.println("등록된 휴관일 ID: " + saved.getClosedId());
	}
	
//	@Test
    @DisplayName("휴관일 조회")
    public void readClosedDay() {
        ClosedDay saved = closedDayRepository.save(
                ClosedDay.builder()
                        .closedDate(LocalDate.of(2025, 6, 1))
                        .build()
        );

        closedDayRepository.findById(saved.getClosedId());
        System.out.println("등록된 휴관일 ID: " + saved.getClosedId());
    }
    
//    @Test
    @DisplayName("휴관일 수정")
    public void updateClosedDay() {
        ClosedDay saved = closedDayRepository.save(
        		ClosedDay.builder()
        				.closedDate(LocalDate.of(2025, 5, 5))
                        .build()
        );

        saved.setClosedDate(LocalDate.of(2025, 5, 8));
        closedDayRepository.save(saved);
    }
    
    @Test
    @DisplayName("휴관일 삭제")
    public void deleteClosedDay() {
        ClosedDay saved = closedDayRepository.save(
                ClosedDay.builder()
                        .closedDate(LocalDate.of(2025, 7, 1))
                        .build()
        );

        Long id = saved.getClosedId();
        closedDayRepository.deleteById(id);

        boolean exists = closedDayRepository.findById(id).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }
	
}
