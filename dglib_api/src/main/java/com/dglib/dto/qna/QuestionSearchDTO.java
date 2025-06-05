package com.dglib.dto.qna;

import lombok.Data;

@Data
public class QuestionSearchDTO {
	private int page = 1;
	private int size = 10;
	private String sortBy = "qno";
	private String orderBy = "desc";
	private String option;
	private String query;
	private String requesterMid;

}