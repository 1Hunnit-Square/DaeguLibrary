package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Top10Books {
	String bookTitle;
	String author;
	String publisher;
	String isbn;
	LocalDate pubDate;
	Long bookCount;
	Long borrowCount;
	
}
