package com.dglib.dto.member;

import java.time.LocalDate;

import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class MemberBorrowHistoryDTO {
	String bookTitle;
	String author;
	String isbn;
	LocalDate rentStartDate;
	LocalDate dueDate;
	LocalDate returnDate;
	Long rentId;
	MemberState memberState;
	RentalState rentalState;
	boolean isDeleted;
}
