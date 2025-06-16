package com.dglib.dto.book;

import lombok.Data;

@Data
public class EbookMemberRequestDTO {
	
	private String query;
	private int page;
	private String option;

}
