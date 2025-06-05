package com.dglib.dto.program;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ProgramInfoDTO {

	private Long progNo;
	private String progName;
	private String teachName;
	private String status; // 신청전, 신청중, 신청마감

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime applyStartAt; // 신청시작기간
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime applyEndAt; // 신청종료기간

	private LocalDate startDate; // 수강시작날짜
	private LocalDate endDate; // 수강종료날짜
	private LocalTime startTime; // 수강시작시간
	private LocalTime endTime; // 수강종료시간

	private List<DayOfWeek> daysOfWeek; // 수강 요일
	private String room; // 강의 장소

	private String target; // 대상
	private int capacity; // 인원
	private int current; // 현재 신청 인원
	private String content; // 프로그램 상세 내용

	private String originalName;
	private String filePath;
	
}
