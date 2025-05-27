package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookNewSumDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String cover;
    private Long libraryBookId;
    private String isbn;

}
