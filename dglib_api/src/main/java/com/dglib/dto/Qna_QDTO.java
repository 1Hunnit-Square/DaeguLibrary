package com.dglib.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class Qna_QDTO {
	private int qno;	//글번호
	private String title;	//제목	
	private String content;	//내용
	private boolean checkPublic;	//공개, 비공개	
	private LocalDate createDate;	//등록일
	private LocalDate modifyDate;	//수정일
	private int viewCount;	//조회 횟수
	private String memberId ;	//회원id
	
	
	
}
