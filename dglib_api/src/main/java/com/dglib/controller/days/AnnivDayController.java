package com.dglib.controller.days;

import java.util.List;

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

import com.dglib.dto.days.AnnivDayDTO;
import com.dglib.service.days.AnnivDayService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/anniv")
@RequiredArgsConstructor
public class AnnivDayController {
	
	private final AnnivDayService annivDayService;
	
	// 등록
	@PostMapping("/register")
	public ResponseEntity<Long> register(@RequestBody AnnivDayDTO dto){
		Long id = annivDayService.registerAnnivDay(dto);
		return ResponseEntity.ok(id);
	}
	
	// 조회
	@GetMapping("/{annivNo}")
    public ResponseEntity<AnnivDayDTO> get(@PathVariable Long annivNo) {
        return ResponseEntity.ok(annivDayService.get(annivNo));
    }
	
	// 전체 조회
	@GetMapping("/all")
    public ResponseEntity<List<AnnivDayDTO>> getAll() {
        return ResponseEntity.ok(annivDayService.getAll());
    }
	
	// 월별 조회
	@GetMapping("/month")
	public ResponseEntity<List<AnnivDayDTO>> getByMonth(
			@RequestParam int year,
			@RequestParam int month) {
		return ResponseEntity.ok(annivDayService.getByMonth(year, month));
	}
	
	// 년,월,일별 조회
	@GetMapping("/day")
	public ResponseEntity<List<AnnivDayDTO>> getDailyList(
	        @RequestParam int year,
	        @RequestParam int month,
	        @RequestParam int day) {
	    return ResponseEntity.ok(annivDayService.getDailyList(year, month, day));
	}
	
	// 일정 수정
	@PutMapping("/{annivNo}")
	public ResponseEntity<String> update(@PathVariable Long annivNo, @RequestBody AnnivDayDTO dto) {
		annivDayService.updateAnnivDay(annivNo, dto);
		return ResponseEntity.ok().build();
	}
	
	// 삭제
	@DeleteMapping("/{annivNo}")
    public ResponseEntity<String> delete(@PathVariable Long annivNo) {
        annivDayService.delete(annivNo);
        return ResponseEntity.noContent().build();

    }

}
