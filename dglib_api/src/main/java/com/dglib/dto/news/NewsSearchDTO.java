package com.dglib.dto.news;

import lombok.Data;

@Data
public class NewsSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
}
