package com.dglib.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Question {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private long qno;	//글번호
	
	@Column(length = 200, nullable = false)
	private String title;	//제목	

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;	//내용
	
	@Column(nullable = false)
	private boolean checkPublic;	//공개, 비공개	
	
	@Column(nullable = false)
	private LocalDate createDate;	//등록일
	
	@Column
	private LocalDate modifyDate;	//수정일
	
	@Column(nullable = false)
	private int viewCount = 0;	//조회 횟수
	
	@ManyToOne
	@JoinColumn(name = "id", nullable = false)
	Member member;	//회원id
	
	public void updateTitle(String title) {
		this.title = title;
		this.modifyDate = LocalDate.now();
	}
	public void updateContent(String content) {
		this.content = content;
		this.modifyDate = LocalDate.now();
	}
	
}
