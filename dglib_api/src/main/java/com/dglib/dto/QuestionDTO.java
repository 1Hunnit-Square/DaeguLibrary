package com.dglib.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class QuestionDTO {
	private long qno;	//글번호
	private String title;	//제목	
	private String content;	//내용
	private boolean checkPublic;	//공개, 비공개	
	private LocalDateTime postedAt;	//등록일
	private LocalDateTime modifiedAt;	//수정일
	private int viewCount;	//조회 횟수
	private String memberId ;	//회원id
	
	
	
}
