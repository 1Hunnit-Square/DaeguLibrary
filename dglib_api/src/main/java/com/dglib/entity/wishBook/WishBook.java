package com.dglib.entity.wishBook;

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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishBook {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long wishNo;
	
	@Column(nullable = false, length = 150)
	private String bookTitle;
	
	@Column(nullable = false, length = 100)
	private String author;
	
	@Column(nullable = false, length = 100)
	private String publisher;
	
	@Column(nullable = false, length = 13)
	private String isbn;
	
	@Column(columnDefinition = "TEXT")
	private String note;
	
	@Column(nullable = false, length = 10)
	private String state;
	
	@Column(nullable = false)
	private LocalDateTime appliedAt;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "memberMid", nullable = false)
	private Member member;	//회원아이디
	
	
}
