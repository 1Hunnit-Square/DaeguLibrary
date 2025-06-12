package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QuestionDetailDTO {

	private String title; // 제목
	private Boolean checkPublic;
	private String content; // 본문
	private LocalDateTime postedAt; // 등록일
	private LocalDateTime modifiedAt; // 수정일
	private int viewCount;
	private String name; // 작성자 이름
	private String writerMid;	// 작성자 ID
	private AnswerDTO answer; // 답변 DTO

}
