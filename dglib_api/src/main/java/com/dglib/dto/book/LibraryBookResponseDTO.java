package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class LibraryBookResponseDTO {
	private String location;
    private String callSign;
    private Long LibraryBookId;
    private boolean isBorrowed;
    private boolean isUnmanned;
    private int reserveCount;
    private LocalDate dueDate;
    private boolean alreadyReservedByMember;
    private boolean alreadyBorrowedByMember;
    private boolean alreadyUnmannedByMember;
    private boolean isOverdue;
    private boolean isReserved;

    

}
