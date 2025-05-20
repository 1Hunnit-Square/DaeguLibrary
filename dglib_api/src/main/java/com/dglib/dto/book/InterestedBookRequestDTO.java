package com.dglib.dto.book;

import lombok.Data;

@Data
public class InterestedBookRequestDTO {
	private String query;
	private int page;
	private String option;


}
