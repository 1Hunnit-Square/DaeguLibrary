package com.dglib.dto.notice;

import lombok.Data;

@Data
public class NoticeSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
}
