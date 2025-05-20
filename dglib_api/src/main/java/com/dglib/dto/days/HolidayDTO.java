package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayDTO {
	
	private LocalDate date;
	private String name;
	private String isHoliday;

}
