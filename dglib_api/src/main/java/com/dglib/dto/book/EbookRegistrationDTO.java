package com.dglib.dto.book;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class EbookRegistrationDTO {
	
	String ebookTitle;
	String ebookAuthor;
	String ebookPublisher;
	String ebookIsbn;
	String ebookDescription;
	LocalDate ebookPubDate;
	MultipartFile  ebookCover;
	MultipartFile  ebookFile;
	

}
