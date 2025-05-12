package com.dglib.dto.program;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import lombok.Data;

@Data
public class ProgramInfoDTO {
	
	private Long progNo;
	private String progName;
	private String teachName;
	private LocalDateTime applyStartAt;	//신청시작기간
	private LocalDateTime applyEndAt;	//신청종료기간
	private List<DayOfWeek> daysOfWeek;
	private String room;
	private LocalDate startDate;	//수강시작날짜
	private LocalDate endDate;	//수강종료날짜
	private LocalTime startTime;	//수강시작시간
	private LocalTime endTime;	//수강종료시간
	private String target;
	private int capacity;
	private String filename;
	private String filePath;
	
}
