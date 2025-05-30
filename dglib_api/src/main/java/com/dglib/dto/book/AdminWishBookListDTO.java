package com.dglib.dto.book;

import java.time.LocalDate;

import com.dglib.entity.book.WishBookState;

import lombok.Data;

@Data
public class AdminWishBookListDTO {
	private Long wishNo;
	private String bookTitle;
	private String author;
	private String publisher;
	private String isbn;
	private String note;
	private WishBookState state;
	private LocalDate appliedAt; 
	private LocalDate processedAt; 
	private String mid;
	
}
