package com.dglib.controller.place;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.place.PlaceDTO;
import com.dglib.dto.place.PlaceSearchConditionDTO;
import com.dglib.dto.place.ReservationStatusDTO;
import com.dglib.service.place.PlaceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
public class PlaceController {

	private final PlaceService placeService;

	// 예약 등록
	@PostMapping("/register")
	public ResponseEntity<String> registerPlace(@RequestBody PlaceDTO dto) {
		Long pno = placeService.registerPlace(dto);
		return ResponseEntity.ok().build();
	}

	// 단건 조회
	@GetMapping("/{pno}")
	public ResponseEntity<PlaceDTO> get(@PathVariable Long pno) {
		PlaceDTO dto = placeService.get(pno);
		return ResponseEntity.ok(dto);
	}

	// 회원별 신청 목록 조회(list)
	@GetMapping("/member/{mid}")
	public ResponseEntity<List<PlaceDTO>> getListByMember(@PathVariable String mid) {
		List<PlaceDTO> list = placeService.getListByMember(mid);
		return ResponseEntity.ok(list);
	}
	
	// 회원별 신청 목록 조회(page)
	@GetMapping("/member/{mid}/page")
	public Page<PlaceDTO> getListByMemberPaged(
			@PathVariable String mid,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size){
		Pageable pageable = PageRequest.of(page, size, Sort.by("useDate").descending());
		return placeService.getListByMemberPaged(mid, pageable);
	}

	// 예약 삭제
	@DeleteMapping("/{pno}")
	public ResponseEntity<String> delete(@PathVariable Long pno) {
		placeService.delete(pno);
		return ResponseEntity.ok().build();
	}

	// 관리자 예약 취소
	@DeleteMapping("/admin/delete/{pno}")
	public ResponseEntity<?> cancelReservationByAdmin(@PathVariable Long pno) {
		placeService.cancelByAdmin(pno);
		return ResponseEntity.ok().build();
	}

	// 이미 예약된 시간대인지 확인 (버튼 비활성화용)
	@GetMapping("/check")
	public ResponseEntity<Boolean> checkSchedule(@RequestParam String room, @RequestParam String date,
			@RequestParam String time) {

		LocalDate useDate = LocalDate.parse(date);
		LocalTime startTime = LocalTime.parse(time);
		boolean exists = placeService.isTimeSlotReserved(room, useDate, startTime);

		return ResponseEntity.ok(exists);
	}

	// 동일 회원이 같은 날, 같은 시설 예약했는지 확인
	@GetMapping("/check-duplicate")
	public ResponseEntity<Boolean> checkDuplicate(@RequestParam String mid, @RequestParam String room,
			@RequestParam String date) {

		LocalDate useDate = LocalDate.parse(date);
		boolean exists = placeService.isDuplicateReservation(mid, room, useDate);

		return ResponseEntity.ok(exists);
	}

	// 월별 예약 현황 (달력)
	@GetMapping("/status")
	public ResponseEntity<List<ReservationStatusDTO>> getMonthlyReservationStatus(@RequestParam int year,
			@RequestParam int month) {

		List<ReservationStatusDTO> list = placeService.getMonthlyReservationStatus(year, month);
		return ResponseEntity.ok(list);
	}

	// 특정 날짜/시설 예약된 시간대 조회 (체크박스 비활성화용)
	@GetMapping("/time-status")
	public ResponseEntity<List<PlaceDTO>> getReservedTimeList(@RequestParam String room, @RequestParam String date) {

		LocalDate useDate = LocalDate.parse(date);
		List<PlaceDTO> list = placeService.getReservedTimes(room, useDate);
		return ResponseEntity.ok(list);
	}

	// 관리자 - 조건 검색 및 페이징
	@GetMapping("/admin")
	public ResponseEntity<Page<PlaceDTO>> getListByAdmin(@ModelAttribute PlaceSearchConditionDTO cond) {
		Page<PlaceDTO> list = placeService.getListByAdmin(cond);
		return ResponseEntity.ok(list);
	}

}
