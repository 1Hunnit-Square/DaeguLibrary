package com.dglib.dto.book;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EbookMemberResponseDTO {
	
	private Long ebookId;
	private String ebookIsbn;
	private String ebookTitle;
	private String ebookAuthor;
	private String ebookPublisher;
	private String ebookPubDate;
	private LocalDateTime lastReadTime;


}
