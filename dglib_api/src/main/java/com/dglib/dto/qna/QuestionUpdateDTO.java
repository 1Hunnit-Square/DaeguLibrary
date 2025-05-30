package com.dglib.dto.qna;

import java.time.LocalDateTime;

public class QuestionUpdateDTO {
	private String title; // 제목
	private String content; // 본문
	private String name; // 작성자 ID
	private LocalDateTime postedAt; // 등록일
	private LocalDateTime modifiedAt; // 수정일
	private AnswerDTO answer;      // 답변 DTO
	
}
