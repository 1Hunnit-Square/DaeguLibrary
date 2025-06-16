package com.dglib.entity.book;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ebook {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ebookId; 
	
	@Column(length = 13)
	private String ebookIsbn;
	
	@Column(nullable = false, length = 255)
	private String ebookTitle;
	
	@Column(nullable = false, length = 255)
	private String ebookAuthor;
	
	@Column(nullable = false, length = 255)
	private String ebookPublisher;
	
	@Column(nullable = false)
	private LocalDate ebookPubDate;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String ebookDescription;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String ebookFilePath;
	
	@Column(columnDefinition = "TEXT")
	private String ebookCover;
	
	@Column(nullable = false)
	private LocalDate ebookRegDate;
	
	@OneToMany(mappedBy = "ebook", cascade = CascadeType.REMOVE, orphanRemoval = true)
	private List<Highlight> highlights;
	
	@OneToMany(mappedBy = "ebook", cascade = CascadeType.REMOVE, orphanRemoval = true)
	private List<EbookReadingProgress> readingProgressList;
	
	

}
