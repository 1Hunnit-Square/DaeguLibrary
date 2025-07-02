package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LibraryBookStatusDTO {
	 	private Long libraryBookId;
	 	private String callSign;
	    private String location;
	    private boolean isDeleted;
	    private boolean isReserved;
	    private boolean isBorrowed;
	    private boolean isOverdue;
	    private long reserveCount;
	    private boolean isUnmanned;
	    private LocalDate dueDate;
}
