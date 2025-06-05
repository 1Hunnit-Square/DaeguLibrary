package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class EbookSummaryDTO {
	
	private Long ebookId;
	
	private String ebookIsbn;
	
	private String ebookTitle;
	
	private String ebookAuthor;
	
	private String ebookPublisher;
	
	private LocalDate ebookPubDate;
	
	private String ebookDescription;
	
	private LocalDate ebookRegDate;
	
	private String ebookCover;

}
