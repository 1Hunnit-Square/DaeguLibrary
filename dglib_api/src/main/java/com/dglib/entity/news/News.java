package com.dglib.entity.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
@Table(name = "news")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class News {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long nno;
	
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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;	//회원아이디
	
	@OneToMany(mappedBy = "news", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<NewsImage> images = new ArrayList<>();
	

	
	
	
	
	

}
