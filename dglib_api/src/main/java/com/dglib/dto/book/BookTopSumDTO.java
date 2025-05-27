package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookTopSumDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String cover;
    private Long libraryBookId;
    private Long borrowCount;
    private String isbn;

}
