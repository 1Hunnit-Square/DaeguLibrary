package com.dglib.entity.news;

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
@Table(name = "news_img")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class NewsImage {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long nino;
	
	@Column(nullable = false)
	private String imageUrl;
	
	@Column(nullable = false)
	private String originalFilename;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "nno", nullable = false)
	private News news;

}
