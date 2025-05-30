package com.dglib.dto.member;

import java.time.LocalDate;

import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class MemberBorrowNowListDTO {
	String bookTitle;
	String author;
	String isbn;
	LocalDate rentStartDate;
	LocalDate dueDate;
	Long reserveCount;
	Long rentId;
	MemberState memberState;
}
