package com.dglib.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookStatusDTO {
    private Long libraryBookId;
    private boolean borrowed;
    private boolean unmanned;
    private boolean overdue;
    private Long reserveCount;
}