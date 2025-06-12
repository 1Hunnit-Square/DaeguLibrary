package com.dglib.dto.program;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ProgramRoomCheckDTO {
	private String room;
	
	private LocalDate startDate;
	private LocalDate endDate;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime startTime;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
	private LocalTime endTime;

	private List<Integer> daysOfWeek;
}
