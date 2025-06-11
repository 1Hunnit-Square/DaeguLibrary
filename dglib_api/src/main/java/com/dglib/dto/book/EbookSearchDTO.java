package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;


@Data
public class EbookSearchDTO {
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
