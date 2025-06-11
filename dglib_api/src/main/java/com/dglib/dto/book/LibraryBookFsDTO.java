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
    private String fingerprint;
    private LocalDate yearStartDate;
    private LocalDate yearEndDate;
    
    
    public void processYearDates() {
        if (yearStart != null) {
            this.yearStartDate = LocalDate.of(yearStart, 1, 1);
        }
        if (yearEnd != null) {
            this.yearEndDate = LocalDate.of(yearEnd, 12, 31);
        }
    }

}
