package com.dglib.dto.program;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramUseDTO {

	private Long progUseNo;	//프로그램 신청번호
	private LocalDateTime applyAt;	//프로그램 신청일
	private String progName;
	private String teachName;
	private LocalDate startDate;
	private LocalDate endDate;
	private String startTime;
	private String endTime;
	private List<Integer> daysOfWeek;
	private String room;
	private int capacity;
	private int current;
	private String status;
	
	private Long progNo;
	private String mid;
	private String name;
	private String email;
	private String phone;

	
	
	
}
