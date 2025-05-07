package com.dglib.dto;

import java.time.LocalDate;

import com.dglib.entity.Member;
import com.dglib.entity.Question;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AnswerDTO {
	
	private long ano;	//답변글 번호
	private long qno;	//질문글 번호
	private LocalDate createDate;	//등록일
	private LocalDate modifyDate;	//수정일	
	private String content;	//내용
	private String memberId ;	//회원id
}
