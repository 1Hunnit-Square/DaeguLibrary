package com.dglib.dto.program;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgramUseDTO {

	private Long progUseNo;	//프로그램번호
	private LocalDateTime applyAt;	//프로그램 신청일
	private String progName;
	private String teachName;
	private LocalDate startDate;
	private LocalDate endDate;
	private String startTime;
	private String endTime;
	private String dayOfWeek;
	private String room;
	private int capacity;
	private int current;
	private String status;
	
	private Long progNo;	//프로그램 정보
	private String mid;	//신청자 ID
	
	
	
}
