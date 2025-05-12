package com.dglib.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notice_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeFile {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long fno;
	
	@Column(nullable = false)
	private String originalName;
	
	@Column(nullable = false)
	private String filePath;
	
	@Column(nullable = false)
	private String fileType;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "noticeAno", nullable = false) // 글번호(FK)
	private Notice notice;
	

}
