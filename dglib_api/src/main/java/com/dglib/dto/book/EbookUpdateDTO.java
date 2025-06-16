package com.dglib.dto.book;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import lombok.ToString;

@Data
public class EbookUpdateDTO {
	
	private Long ebookId;

	private String ebookIsbn;

	private String ebookTitle;

	private String ebookAuthor;

	private String ebookPublisher;

	private LocalDate ebookPubDate;

	private String ebookDescription;

	private MultipartFile ebookCover;
	
	private String isDelete;
	
	private String existingImagePath;






}
