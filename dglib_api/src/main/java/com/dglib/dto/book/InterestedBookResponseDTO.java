package com.dglib.dto.book;

import lombok.Data;

@Data
public class InterestedBookResponseDTO {
	String ibId;
	String bookTitle;
	String author;
	String publisher;
	String Location;
	String callSign;
	boolean isReserved;
	boolean isBorrowed;
	boolean isUnmanned;
	Long reserveCount;
	Long libraryBookId;
	String isbn;
	boolean isDeleted;
	
}
