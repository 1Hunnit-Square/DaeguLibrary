package com.dglib.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor 
public class BookStatusInfoDTO {
    private boolean reserved;
    private boolean unmanned;
    private boolean borrowed;
    private long reserveCount;

}
