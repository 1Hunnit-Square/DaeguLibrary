package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClosedDayDTO {
	
	private LocalDate closedDate;
	private String reason;
	private Boolean isClosed;
	private String originalDate;
	private String type;

}
