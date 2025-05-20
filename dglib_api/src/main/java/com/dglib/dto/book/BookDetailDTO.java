package com.dglib.dto.book;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class BookDetailDTO {
	private String libraryBookId;
	private String bookTitle;
    private String author;
    private String publisher;
    private LocalDate pubDate;
    private String cover;
    private String isbn;
    private String description;
    private List<LibraryBookResponseDTO> libraryBooks;

}
