package com.dglib.dto.program;

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
	private String content; // 프로그램 상세 내용
	private String status; // 신청전, 신청중, 신청마감
	private String target; // 대상
	private int capacity; // 인원
	private int current; // 현재 신청 인원
	private String room; // 강의 장소
	

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime applyStartAt; // 신청시작기간

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime applyEndAt; // 신청종료기간
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate startDate; // 수강시작날짜
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate endDate; // 수강종료날짜

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime startTime; // 수강시작시간

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime endTime; // 수강종료시간

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime createdAt; // 등록일

	private String originalName; // 파일 명
	private String filePath; // 파일 경로

	private List<Integer> daysOfWeek; // 요일 (숫자)
	private List<String> dayNames;    // 요일 한글명 (월, 화, 수...)


}
