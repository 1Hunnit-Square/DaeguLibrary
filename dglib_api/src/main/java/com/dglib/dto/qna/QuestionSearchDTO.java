package com.dglib.dto.qna;

import lombok.Data;

@Data
public class QuestionSearchDTO {
	private String query;	//검색어
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
	private String requesterMid;

  
    
}