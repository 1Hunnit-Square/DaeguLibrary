package com.dglib.controller.place;

import java.time.LocalDate;
import java.time.LocalTime;
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

import com.dglib.dto.place.PlaceDTO;
import com.dglib.repository.place.PlaceRepository;
import com.dglib.service.place.PlaceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/places")
public class PlaceController {
	
	private final PlaceService placeService;
	private final PlaceRepository placeRepository;

	
	// 등록
	@PostMapping("/register")
	public ResponseEntity<String> registerPlace(@RequestBody PlaceDTO dto){
		Long pno = placeService.registerPlace(dto);
		
		return ResponseEntity.ok().build();
	}
	
	// 조회
	@GetMapping("/{pno}")
	public ResponseEntity<PlaceDTO> get(@PathVariable Long pno){
		PlaceDTO dto = placeService.get(pno);
		
		return ResponseEntity.ok(dto);
	}
	
	// 회원별 신청 목록 조회
	@GetMapping("/member/{mid}")
    public ResponseEntity<List<PlaceDTO>> getListByMember(@PathVariable String mid) {
        List<PlaceDTO> list = placeService.getListByMember(mid);
        return ResponseEntity.ok(list);
    }
	
	// 신청 취소(삭제)
	@DeleteMapping("/{pno}")
	public ResponseEntity<String> delete(@PathVariable Long pno){
		placeService.delete(pno);
		
		return ResponseEntity.ok().build();
	}
	
	// 이미 예약된 시간대인지 확인(버튼 비활성화)
	 @GetMapping("/check")
	    public ResponseEntity<Boolean> checkSchedule(
	            @RequestParam String room,
	            @RequestParam String date,
	            @RequestParam String time
	    ) {
	        boolean exists = placeRepository.existsBySchedule(
	                room, LocalDate.parse(date), LocalTime.parse(time));
	        return ResponseEntity.ok(exists);
	    }
	 
	// 동일 회원이 같은 날, 같은 시설 예약했는지 확인(버튼 비활성화)
	    @GetMapping("/check-duplicate")
	    public ResponseEntity<Boolean> checkDuplicate(
	            @RequestParam String mid,
	            @RequestParam String room,
	            @RequestParam String date
	    ) {
	        boolean exists = placeRepository.existsByMember_MidAndRoomAndUseDate(
	                mid, room, LocalDate.parse(date));
	        return ResponseEntity.ok(exists);
	    }	

}
