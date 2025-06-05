package com.dglib.entity.notice;

import java.time.LocalDateTime;
import java.util.List;

import com.dglib.entity.member.Member;

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
	private Long ano; // 글번호(PK)
	
	@Column(nullable = false, length = 200)
	private String title;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;
	
	@Column(nullable = false)
	private LocalDateTime postedAt; // 게시일
	
	private LocalDateTime modifiedAt; // 수정일
	
	@Builder.Default
	@Column(nullable = false)
	private int viewCount = 0; // 조회수
	
	@Builder.Default
	@Column(nullable = false)
	private boolean isHidden = false; // 숨김 여부
	
	@Builder.Default
	@Column(nullable = false)
	private boolean isPinned = false; // 고정 여부
	
	
	// 파일 연관관계
	@OneToMany(mappedBy = "notice", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<NoticeFile> files;

	
	// FK: 회원 ID(작성자)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;
	
	
	

}
