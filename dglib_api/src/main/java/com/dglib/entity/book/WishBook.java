package com.dglib.entity.book;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.dglib.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishBook {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long wishNo;
	
	@Column(nullable = false, length = 255)
	private String bookTitle;
	
	@Column(nullable = false, length = 255)
	private String author;
	
	@Column(nullable = false, length = 255)
	private String publisher;
	
	@Column(nullable = false, length = 13)
	private String isbn;
	
	@Column(columnDefinition = "TEXT")
	private String note;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private WishBookState state;
	
	@Column(nullable = false)
	private LocalDate appliedAt;
	
	@Column(nullable = true)
	private LocalDate processedAt;

	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;	//회원아이디
	
	
}
