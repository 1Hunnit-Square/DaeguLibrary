package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String isbn;
    private String description;
    private String cover;

}
