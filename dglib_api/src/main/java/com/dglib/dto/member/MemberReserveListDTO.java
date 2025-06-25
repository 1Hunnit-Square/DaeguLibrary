package com.dglib.dto.member;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MemberReserveListDTO {
	Long reserveId;
	String bookTitle;
	String author;
	LocalDateTime reserveDate;
	LocalDate dueDate;
	int reserveRank;
	boolean isUnmanned;
	String isbn;
	boolean isReturned;

	

}
