package com.dglib.entity.qna;


import java.time.LocalDateTime;

import com.dglib.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
	private Long qno;	//글번호
	
	@Column(length = 200, nullable = false)
	private String title;	//제목	

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;	//내용
	
	@Builder.Default
	@Column(nullable = false)
	private boolean checkPublic = false;	//공개, 비공개	
	
	@Column(nullable = false)
	private LocalDateTime postedAt;	//등록일
	
	@Column
	private LocalDateTime modifiedAt;	//수정일
	
	@Builder.Default
	@Column(nullable = false)
	private int viewCount = 0;	//조회 횟수
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "memberMid", nullable = false)
	private Member member;	//회원id
	
	public void updateTitle(String title) {
		this.title = title;
		this.modifiedAt = LocalDateTime.now();
	}
	public void updateContent(String content) {
		this.content = content;
		this.modifiedAt = LocalDateTime.now();
	}
	
}
