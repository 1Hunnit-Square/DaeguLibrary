package com.dglib.controller.days;

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
	
	// 휴관일 등록
	@PostMapping("/register")
	public ResponseEntity<Long> registerClosedDay(@RequestBody ClosedDayDTO dto){
		Long id = closedDayService.registerClosedDay(dto);
		
		return ResponseEntity.ok(id);
	}
	
	// 월별 휴관일 조회
	@GetMapping
	public ResponseEntity<List<ClosedDayDTO>> getMonthlyList(@RequestParam int year, @RequestParam int month){
		List<ClosedDayDTO> list = closedDayService.getMonthlyList(year, month);
		
		return ResponseEntity.ok(list);
	}
	
	// 삭제
	@DeleteMapping("/{closedId}")
	public ResponseEntity<Void> delete(@PathVariable Long closedId){
		closedDayService.delete(closedId);
		
		return ResponseEntity.noContent().build();
	}
	
	// 해당 월의 월요일 등록(휴관일)
	@PostMapping("/mondays")
	public ResponseEntity<List<Long>> registerMondays(@RequestParam int year, @RequestParam int month){
		List<Long> ids = closedDayService.registerMondays(year, month);
		
		return ResponseEntity.ok(ids);

	}
	
	// 전체 휴관일 등록
	@PostMapping("/holidays")
	public ResponseEntity<List<Long>> registerPolicy(@RequestParam int year) {
	    List<Long> ids = closedDayService.registerHolidays(year);
	    
	    return ResponseEntity.ok(ids);
	}


}
