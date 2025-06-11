package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class QuestionUpdateDTO {
	private String title; // 제목
	private String content; // 본문
	private String name; // 작성자 ID
	private Boolean checkPublic;	// 공개 여부
	private LocalDateTime postedAt; // 등록일
	private LocalDateTime modifiedAt; // 수정일
	private String writerMid;
	private AnswerDTO answer;      // 답변 DTO
	
}
