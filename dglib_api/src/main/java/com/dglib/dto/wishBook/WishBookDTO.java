package com.dglib.dto.wishBook;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class WishBookDTO {

	private Long wishNo;
	private String bookTitle;
	private String author;
	private String publisher;
	private String isbn;
	private String note;
	private String state;
	private LocalDateTime appliedAt;
	
	
	private String memberMid;
	
}
