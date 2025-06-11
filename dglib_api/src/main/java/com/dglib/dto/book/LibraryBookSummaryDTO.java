package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class LibraryBookSummaryDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
	private String location;
    private String callSign;
    private String isbn;
    private LocalDate regLibraryBookDate;
    private Long libraryBookId;
    private boolean isRented;
    private int reserveCount; 
    private boolean isUnmanned;
    private boolean isDeleted;

}
