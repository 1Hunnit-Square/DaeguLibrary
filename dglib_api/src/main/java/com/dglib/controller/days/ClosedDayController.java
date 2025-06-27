package com.dglib.controller.days;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.days.HolidayDTO;
import com.dglib.service.days.ClosedDayService;
import com.dglib.service.days.HolidayApiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/closed")
@RequiredArgsConstructor
public class ClosedDayController {

	private final ClosedDayService closedDayService;
	private final HolidayApiService holidayApiService;

	// 수동 등록
	@PostMapping("/register")
	public ResponseEntity<LocalDate> register(@RequestBody ClosedDayDTO dto) {
		LocalDate date = closedDayService.registerClosedDay(dto);
		return ResponseEntity.ok(date);
	}

	// 자동 등록 안됐을 경우 등록(프론트)
	@PostMapping("/auto-register")
	public ResponseEntity<String> registerAllClosedDaysManually() {
		int year = LocalDate.now().getYear();
		try {
			closedDayService.registerAllAutoEventsForYear(year);
			return ResponseEntity.ok("자동 등록 완료");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("자동 등록 실패: " + e.getMessage());
		}
	}

	// 단일 조회
	@GetMapping("/{date}")
	public ResponseEntity<ClosedDayDTO> get(@PathVariable("date") String dateStr) {
		LocalDate date = LocalDate.parse(dateStr);
		ClosedDayDTO dto = closedDayService.get(date);
		return ResponseEntity.ok(dto);
	}

	// 공휴일 여부 및 이름 확인 (프론트 모달 표시용)
	@GetMapping("/holidayInfo")
	public ResponseEntity<Map<String, Object>> getHolidayInfo(@RequestParam LocalDate date) {
		Optional<HolidayDTO> holiday = holidayApiService.getHolidayByDate(date);

		Map<String, Object> result = new HashMap<>();
		result.put("isHoliday", holiday.isPresent());
		result.put("holidayName", holiday.map(HolidayDTO::getName).orElse(null));

		return ResponseEntity.ok(result);
	}

	// 월별 조회
	@GetMapping
	public ResponseEntity<List<ClosedDayDTO>> getMonthlyList(@RequestParam int year, @RequestParam int month) {
		List<ClosedDayDTO> list = closedDayService.getMonthlyList(year, month);
		return ResponseEntity.ok(list);
	}

	// 수정
	@PutMapping("/modify")
	public ResponseEntity<?> updateClosedDay(@RequestBody ClosedDayDTO dto) {
		if (dto.getOriginalDate() == null) {
			throw new IllegalArgumentException("기존 날짜 정보가 필요합니다.");
		}
		closedDayService.update(dto.getOriginalDate(), dto);
		return ResponseEntity.ok().build();
	}

	// 삭제
	@DeleteMapping("/{date}")
	public ResponseEntity<Void> delete(@PathVariable("date") String dateStr) {
		LocalDate date = LocalDate.parse(dateStr);
		closedDayService.delete(date);
		return ResponseEntity.noContent().build();
	}

	// 전체 삭제 (테스트용)
//	@DeleteMapping("/all")
//	public ResponseEntity<String> deleteAllClosedDays() {
//		closedDayService.deleteAllClosedDays();
//		return ResponseEntity.ok("전체 휴관일 삭제 완료");
//	}

	// 월요일 자동 등록
	@PostMapping("/auto/mondays")
	public ResponseEntity<Void> registerMondays(@RequestParam int year) {
		closedDayService.registerMondays(year);
		return ResponseEntity.ok().build();
	}

	// 공휴일 자동 등록
	@PostMapping("/auto/holidays")
	public ResponseEntity<Void> registerHolidays(@RequestParam int year) {
		closedDayService.registerHolidays(year);
		return ResponseEntity.ok().build();
	}

	// 개관일 자동 등록 (매년 7월 8일)
	@PostMapping("/auto/anniv")
	public ResponseEntity<Void> registerOpeningDay(@RequestParam int year) {
		closedDayService.registerLibraryAnniversary(year);
		return ResponseEntity.ok().build();
	}

	// 연도별 자동 등록
	@PostMapping("/auto")
	public ResponseEntity<Void> registerAuto(@RequestParam int year) {
		try {
			closedDayService.registerAllAutoEventsForYear(year);
		} catch (Exception e) {
			log.warn("자동 등록 중 예외 발생 (이미 등록된 연도일 수 있음): {}", e.getMessage());
		}
		return ResponseEntity.ok().build();
	}

	// 연도 범위 자동 등록
	@PostMapping("/auto/range")
	public ResponseEntity<Void> registerAutoRange(@RequestParam int start, @RequestParam int end) {
		for (int y = start; y <= end; y++) {
			closedDayService.registerAllAutoEventsForYear(y);
		}
		return ResponseEntity.ok().build();
	}

}
