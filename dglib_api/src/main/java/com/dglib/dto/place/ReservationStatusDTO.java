package com.dglib.dto.place;

import java.time.LocalDate;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationStatusDTO {
	//날짜별 예약 현황 (캘린더용)
	private LocalDate date;
	private boolean closed;              // 휴관 여부
	private String reason;               // 사유 (공휴일/ 정기휴관일/ 개관일 등)
	private Map<String, String> status;  // 각 공간별 예약 상태

}
