package com.dglib.dto;

import java.time.LocalDate;

import com.dglib.entity.Member;
import com.dglib.entity.Qna_Q;

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
public class Qna_ADTO {
	
	private int ano;	//답변글 번호
	private Qna_Q qna_q;	//fk 질문글 번호
	private LocalDate createDate;	//등록일
	private LocalDate modifyDate;	//수정일	
	private String content;	//내용
	Member member;	//회원id
}
