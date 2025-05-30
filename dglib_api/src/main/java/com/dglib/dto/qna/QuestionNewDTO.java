package com.dglib.dto.qna;

import lombok.Data;

@Data
public class QuestionNewDTO {

	private String title;	// 제목
	private Boolean checkPublic;	// 공개 여부
	private String content;	// 본문
	private String memberMid;	// 작성자 ID
}
