package com.dglib.dto.book;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.ReserveState;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ReserveBookListDTO {

	private Long reserveId;
	private LocalDateTime reserveDate;
	private boolean isUnmanned;
	private ReserveState state;
	private String mid;
	private String bookTitle;
	private String libraryBookId;
	private String author;
	private String isbn;
	private Integer reservationRank;
	private boolean isOverdue;;

}
