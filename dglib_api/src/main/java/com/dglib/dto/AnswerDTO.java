package com.dglib.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AnswerDTO {
	
	private long ano;	//답변글 번호
	private long qno;	//질문글 번호
	private LocalDate postedAt;	//등록일
	private LocalDate modifiedAt;	//수정일	
	private String content;	//내용
	private String memberId ;	//회원id
}
