package com.dglib.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReserveStatusDTO {
    private Long libraryBookId;
    private boolean unmanned;
}