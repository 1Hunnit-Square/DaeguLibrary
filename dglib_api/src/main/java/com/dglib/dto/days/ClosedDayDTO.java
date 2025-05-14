package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClosedDayDTO {
	
	private Long closedId;
	private LocalDate closedDate;
	private boolean isClosed;
}
