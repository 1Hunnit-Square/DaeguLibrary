package com.dglib.dto.event;

import lombok.Data;

@Data
public class EventSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
}
