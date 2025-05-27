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
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Answer {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ano;
	
	@OneToOne
	@JoinColumn(name = "qno", nullable = false)
	private Question question;
	
	@Column(nullable = false)
	private LocalDateTime postedAt;	//등록일
	
	@Column
	private LocalDateTime modifiedAt;	//수정일	
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;	//내용
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;	//회원id
	
	
	public void updateContent(String content) {
		this.content = content;
		this.modifiedAt = LocalDateTime.now();
	}
}
