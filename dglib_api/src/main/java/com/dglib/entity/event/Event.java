package com.dglib.entity.event;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Event {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long eno; // 글번호(PK)

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

	@Column(nullable = false)
	private LocalDateTime postedAt; // 게시일
	
	private LocalDateTime modifiedAt; // 수정일

	@Column(nullable = false)
	@Builder.Default
	private int viewCount = 0; // 조회수

	@Column(nullable = false)
	@Builder.Default
	private boolean isHidden = false; // 숨김 여부

	@Column(nullable = false)
	@Builder.Default
	private boolean isPinned = false; // 고정 여부
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;	//회원아이디

	@OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default // 이미지를 기본으로 초기화
	private List<EventImage> images = new ArrayList<>(); //새소식이미지
	
	@OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
	private EventBanner banner; //배너

	
	//EventImage 메서드
//	public void addImage(EventImage image) {
//		images.add(image);
//		image.setEvent(this);
//	}
	

}
