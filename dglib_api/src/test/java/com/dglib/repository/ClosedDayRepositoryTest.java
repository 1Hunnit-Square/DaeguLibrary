package com.dglib.repository;

import static org.assertj.core.api.Assertions.assertThat;

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
	
	ClosedDay testDay;
	
//	@Test
    @DisplayName("휴관일 등록")
	public void registerClosedDayTest() {
		testDay = ClosedDay.builder()
				.closedDate(LocalDate.of(2025, 5, 5))
				.reason("어린이날")
				.isClosed(true)
				.build();
		
		ClosedDay saved = closedDayRepository.save(testDay);
		System.out.println("저장된 휴관일: " + saved.getClosedDate());
		System.out.println("사유: " + saved.getReason());
	}
	
//	@Test
	@DisplayName("휴관일 조회")
	public void findClosedDayTest() {
		ClosedDay day = ClosedDay.builder()
				.closedDate(LocalDate.of(2025, 5, 5))
				.reason("어린이날")
				.isClosed(true)
				.build();
		closedDayRepository.save(day);
		
		ClosedDay find = closedDayRepository.findById(LocalDate.of(2025, 5, 5))
				.orElseThrow(() -> new RuntimeException("해당 날짜 없음"));
		
		System.out.println("조회한 날짜: " + find.getClosedDate());
		System.out.println("사유: " + find.getReason());
		System.out.println("휴관여부: " + find.getIsClosed());
	}
	
//	@Test
	@DisplayName("휴관일 수정")
	public void updateClosedDayTest() {
		LocalDate date = LocalDate.of(2025, 6, 10);
		closedDayRepository.save(ClosedDay.builder()
				.closedDate(date)
				.reason("수정 전")
				.isClosed(true)
				.build());

		ClosedDay find = closedDayRepository.findById(date)
				.orElseThrow(() -> new RuntimeException("해당 날짜 없음"));
		find.setReason("수정된 사유");
		find.setIsClosed(false);

		ClosedDay updated = closedDayRepository.save(find);

		assertThat(updated.getReason()).isEqualTo("수정된 사유");
		assertThat(updated.getIsClosed()).isFalse();

		System.out.println("수정된 날짜: " + updated.getClosedDate());
		System.out.println("변경된 사유: " + updated.getReason());
		System.out.println("변경된 휴관 여부: " + updated.getIsClosed());
	}
	
	@Test
    @DisplayName("휴관일 삭제")
    public void deleteClosedDayTest() {
        // given
        LocalDate date = LocalDate.of(2025, 6, 10);
        closedDayRepository.save(ClosedDay.builder()
                .closedDate(date)
                .reason("삭제 테스트")
                .isClosed(true)
                .build());

        // when
        closedDayRepository.deleteById(date);

        // then
        boolean exists = closedDayRepository.findById(date).isPresent();
        System.out.println("삭제된 날짜: " + date);
        System.out.println("삭제 후 존재 여부: " + exists);
        assertThat(exists).isFalse();
    }
	
	
}
