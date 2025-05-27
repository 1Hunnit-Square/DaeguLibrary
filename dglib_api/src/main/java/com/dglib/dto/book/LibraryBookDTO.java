package com.dglib.dto.book;

import lombok.Data;

@Data
public class LibraryBookDTO {
	private String location;
    private String callSign;
    private Long LibraryBookId;
    private boolean isDeleted;
}
