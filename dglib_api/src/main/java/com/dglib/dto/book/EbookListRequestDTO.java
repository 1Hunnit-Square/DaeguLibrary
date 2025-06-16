package com.dglib.dto.book;

import lombok.Data;

@Data
public class EbookListRequestDTO {
	
	private int page;
	private int size;
	private String query;
	private String option;
	

}
