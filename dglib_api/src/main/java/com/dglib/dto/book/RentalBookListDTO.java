package com.dglib.dto.book;

import java.time.LocalDate;

import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.Member;

import lombok.Data;


@Data
public class RentalBookListDTO {

	private LocalDate rentStartDate;
	private LocalDate dueDate;
	private LocalDate returnDate;
	private boolean isUnmanned;
	private RentalState state;
	private String mid;
	private String bookTitle;
	private String author;
	private String isbn;
	private String libraryBookId;
	private Long rentId;
	

}
