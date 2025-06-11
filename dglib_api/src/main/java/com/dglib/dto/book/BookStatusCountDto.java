package com.dglib.dto.book;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookStatusCountDto {
	private Long reserveCount;
    private Long borrowCount;
    private Long unmannedCount;

}
