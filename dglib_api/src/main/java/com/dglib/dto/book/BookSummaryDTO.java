package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookSummaryDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String cover;
	private String location;
    private String callSign;
    private String isbn;
    private Long libraryBookId;
    private boolean isBorrowed;
    private boolean alreadyReservedByMember;
    private boolean alreadyBorrowedByMember;
    private boolean alreadyUnmannedByMember;;
    private boolean isUnmanned;
    private int reserveCount; 

}
