package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminWishBookSearchDTO {
	private String query;
	private int page = 1;
	private int size = 10;
	private String option;
	private LocalDate startDate;
	private LocalDate endDate;
	private String sortBy;
	private String orderBy;
	private String check;
	

}
