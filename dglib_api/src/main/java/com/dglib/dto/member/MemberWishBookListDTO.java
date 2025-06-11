package com.dglib.dto.member;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MemberWishBookListDTO {
	
	private Long wishNo;
	private String bookTitle;
	private String author;
	private String publisher;
	private String isbn;
	private String note;
	private String state;
	private LocalDate appliedAt;
	private LocalDate processedAt;

}
