package com.dglib.entity.book;

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
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EbookReadingProgress {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ebookRid;
	
	
	@Column(nullable = false, length = 1000)
	private String startCfi;
	
	@Column(nullable = false)
	private LocalDateTime lastReadTime;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ebookId", nullable = false)
	private Ebook ebook;
	
	

}
