package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationCountDTO {
	private Long libraryBookId;
    private Long count;
    
    
    

}
