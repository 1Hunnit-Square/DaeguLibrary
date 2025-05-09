package com.dglib.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Answer {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long ano;
	
	@OneToOne
	@JoinColumn(name = "qno")
	private Question qna_q;
	
	@Column(nullable = false)
	private LocalDateTime postedAt;	//등록일
	
	@Column
	private LocalDateTime modifiedAt;	//수정일	
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;	//내용
	
	@ManyToOne
	@JoinColumn(name = "id", nullable = false)
	Member member;	//회원id
	
	
	public void updateContent(String content) {
		this.content = content;
		this.modifiedAt = LocalDateTime.now();
	}
}
