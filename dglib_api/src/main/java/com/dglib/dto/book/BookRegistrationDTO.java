package com.dglib.dto.book;

import java.util.List;

import lombok.Data;

@Data
public class BookRegistrationDTO {
    private BookDTO book;
    private List<LibraryBookDTO> libraryBooks;

}
