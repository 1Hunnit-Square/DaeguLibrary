package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AnnivDayDTO {

	private Long annivNo;
	private LocalDate annivDate;
	private String annivType;
	private String annivName;
}
