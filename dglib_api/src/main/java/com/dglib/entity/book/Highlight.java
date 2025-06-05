package com.dglib.entity.book;

import java.time.LocalDateTime;

import jakarta.persistence.Id;

import com.dglib.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Highlight {
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long highlightId;
	
	
	@Column(name = "highlightKey", nullable = false)
	private String key;
	
	@Column(nullable = false)
	private String color;
	
	 @Column(nullable = false)
	 private String paragraphCfi;
	 
	 @Column(nullable = false, length = 1000)
	 private String cfiRange;
	 
	 
	 private String chapterName;
	 
	 
	 private Integer pageNum;
	 
	 @Column(nullable = false, columnDefinition = "TEXT")
	 private String content;
	 
	
	 private LocalDateTime createdAt;
	 
	
	 private LocalDateTime updatedAt;
	
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ebookId", nullable = false)
	private Ebook ebook;

}
