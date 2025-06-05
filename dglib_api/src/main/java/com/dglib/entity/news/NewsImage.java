package com.dglib.entity.news;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class NewsImage {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ino;
	
	@Column(nullable = false, length = 255)
	private String originalName;
	
	@Column(nullable = false, length = 500)
	private String filePath;	
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "newsNno", nullable = false)
	private News news;

}
