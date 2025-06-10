package com.dglib.dto.program;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class ProgramRoomCheckDTO {
	// 프로그램 등록 전, 해당 기간 및 요일에 모든 장소가 이미 예약되어 있는지 확인
	private LocalDate startDate;
    private LocalDate endDate;
    private List<Integer> daysOfWeek;


}
