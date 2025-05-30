package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class QuestionListDTO {

	private Long qno; // 글 번호
	private String status; // 질문 상태: 접수 or 완료
	private String title; // 제목
	private Boolean checkPublic; // 공개 여부
	private String name; // 작성자 이름
	private LocalDateTime postedAt; // 등록일
	private int viewCount; // 조회 수

}
