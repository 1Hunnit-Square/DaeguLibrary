package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LibraryBookSearchByBookIdDTO {
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
	private String location;
    private String callSign;
    private String isbn;
    private Long libraryBookId;
    private boolean isRented;
    private boolean isReserved;
    private boolean isUnmanned;
}
