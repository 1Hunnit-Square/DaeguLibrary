package com.dglib.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notice")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Notice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int ano; // 글번호(PK)
	
	@Column(nullable = false, length = 200)
	private String title;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;
	
	@Column(nullable = false)
	private LocalDate createDate; // 게시일
	
	private LocalDate modifyDate; // 수정일
	
	@Column(nullable = false)
	private int viewCount = 0; // 조회수
	
	@Column(nullable = false)
	private boolean isHidden = false; // 숨김 여부
	
	@Column(nullable = false)
	private boolean isPinned = false; // 고정 여부
	
	
	// 공지사항 조회 시 이미지까지 같이 조회
	@OneToMany(mappedBy = "notice", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<NoticeImage> images = new ArrayList<>();

	
	// FK: 회원 ID(작성자)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id")
	private Member member;
	
	

}
