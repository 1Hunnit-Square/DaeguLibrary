package com.dglib.dto.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class BorrowedBookSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String check;
	private LocalDate startDate;
	private LocalDate endDate;
	private String sortBy;
	private String orderBy;
	private LocalDateTime startDateWithTime;
	private LocalDateTime endDateWithTime;
	private String state;
	
	public void updateDateTimeRange() {
		this.startDateWithTime = this.startDate.atStartOfDay();
		this.endDateWithTime = this.endDate.atTime(LocalTime.MAX);
	}
}
