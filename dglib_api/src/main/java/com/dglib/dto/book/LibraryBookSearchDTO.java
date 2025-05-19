package com.dglib.dto.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Data;

@Data
public class LibraryBookSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private LocalDate startDate;
	private LocalDate endDate;
	private String sortBy;
	private String orderBy;
	private String state;
	
	

}
