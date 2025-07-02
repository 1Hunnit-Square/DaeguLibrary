package com.dglib.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data  
@AllArgsConstructor
public class RentalStatusDTO {
    private Long libraryBookId;
    private boolean borrowed;
}