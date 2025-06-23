package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminQnaDTO {
	
	private Long qno; // 글 번호
	private String status; // 접수 or 완료 or 전체
	private String title; // 제목
	private Boolean checkPublic; // 공개 여부
	private String name; // 작성자 이름
	private LocalDateTime postedAt; // 등록일
	private LocalDateTime modifiedAt; // 수정일
	private int viewCount; // 조회 수
	private String Mid;	// 작성자 ID
}
