package com.dglib.service.place;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.place.PlaceDTO;
import com.dglib.dto.place.PlaceSearchConditionDTO;
import com.dglib.dto.place.ReservationStatusDTO;

public interface PlaceService {

	// ===== 예약 등록 및 조회 (CRUD) =====
	Long registerPlace(PlaceDTO dto); // 예약 등록

	PlaceDTO get(Long pno); // 예약 단건 조회

	void delete(Long pno); // 예약 취소

	// ===== 회원별 예약 목록 =====
	List<PlaceDTO> getListByMember(String mid);
	Page<PlaceDTO> getListByMemberPaged(String mid, Pageable pageable);

	// ===== 달력 월별 예약 현황 =====
	List<ReservationStatusDTO> getMonthlyReservationStatus(int year, int month); // 날짜+공간별 상태(full/available)

	// ===== 예약 중복 / 시간 상태 체크 =====
	boolean isTimeSlotReserved(String room, LocalDate date, LocalTime time); // 특정 시간 예약 여부

	boolean isDuplicateReservation(String mid, String room, LocalDate date); // 동일 시설 중복 예약 여부

	List<PlaceDTO> getReservedTimes(String room, LocalDate date); // 특정 날짜의 시간대별 예약 내역
	
	// ===== 관리자 =====
	Page<PlaceDTO> getListByAdmin(PlaceSearchConditionDTO cond);
	
	// 예약 취소(과거 예약 포함 허용)
	void cancelByAdmin(Long pno);

}
