package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ClosedDayDTO {
	
	private Long closedId;
	private LocalDate closedDate;
	private boolean isClosed;
}
