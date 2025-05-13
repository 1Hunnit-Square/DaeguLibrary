package com.dglib.dto.book;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LibraryBookFsDTO {
	private String title;
    private String isbn;
    private String author;
    private Integer yearStart;
    private Integer yearEnd;
    private String publisher;
    private String sortBy;
    private String orderBy;
    private String keyword;
    private LocalDate yearStartDate;
    private LocalDate yearEndDate;
    
    public void processSortByField() {
    	if (sortBy == null) {
            setSortBy("bookTitle");
            return;
        }
        switch (sortBy) {
            case "제목":
            	setSortBy("bookTitle");
                break;
            case "저자":
            	setSortBy("author");
                break;
            case "출판사":
            	setSortBy("publisher");
                break;
            case "발행연도":
            	setSortBy("pubDate");
            	break;
        }
    }
    
    public void processYearDates() {
        if (yearStart != null) {
            this.yearStartDate = LocalDate.of(yearStart, 1, 1);
        }
        if (yearEnd != null) {
            this.yearEndDate = LocalDate.of(yearEnd, 12, 31);
        }
    }

}
