package com.dglib.controller.days;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.service.days.ClosedDayService;

import lombok.RequiredArgsConstructor;

	@RestController
	@RequestMapping("/api/closed")
	@RequiredArgsConstructor
	public class ClosedDayController {

	    private final ClosedDayService closedDayService;

	    // 수동 등록
	    @PostMapping("/register")
	    public ResponseEntity<LocalDate> register(@RequestBody ClosedDayDTO dto) {
	        LocalDate date = closedDayService.registerClosedDay(dto);
	        return ResponseEntity.ok(date);
	    }

	    // 단일 조회
	    @GetMapping("/{date}")
	    public ResponseEntity<ClosedDayDTO> get(@PathVariable("date") String dateStr) {
	        LocalDate date = LocalDate.parse(dateStr);
	        ClosedDayDTO dto = closedDayService.get(date);
	        return ResponseEntity.ok(dto);
	    }

	    // 월별 조회
	    @GetMapping
	    public ResponseEntity<List<ClosedDayDTO>> getMonthlyList(
	            @RequestParam int year,
	            @RequestParam int month) {
	        List<ClosedDayDTO> list = closedDayService.getMonthlyList(year, month);
	        return ResponseEntity.ok(list);
	    }

	    // 삭제
	    @DeleteMapping("/{date}")
	    public ResponseEntity<Void> delete(@PathVariable("date") String dateStr) {
	        LocalDate date = LocalDate.parse(dateStr);
	        closedDayService.delete(date);
	        return ResponseEntity.noContent().build();
	    }

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
	}

