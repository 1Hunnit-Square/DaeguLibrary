package com.dglib.dto.book;

import lombok.Data;

@Data
public class RegWishBookDTO {
	
	private String bookTitle;
	private String author;
	private String publisher;
	private String isbn;
	private String note;

}
