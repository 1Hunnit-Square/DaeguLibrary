package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookDetailDTO {
	private String libraryBookId;
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String cover;
    private String location;
    private String callSign;
    private String isbn;
    private String description;
    private boolean isRented;
    private boolean alreadyReservedByMember;
    private boolean alreadyBorrowedByMember;
    private boolean isOverdue;
    private int reserveCount; 

}
