package com.dglib.dto.program;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ProgramBannerDTO {

	private Long bno;
	private String imageName;
	private String imageUrl;
	private String thumbnailPath;
	private Long programInfoId;

	private String progName;
	private String target; // 대상
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate startDate; // 수강시작날짜
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate endDate; // 수강종료날짜
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime startTime; // 수강시작시간
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime endTime; // 수강종료시간
	
	private List<Integer> daysOfWeek; // 요일 (숫자)
	private List<String> dayNames;    // 요일 한글명 (월, 화, 수...)
	

}
