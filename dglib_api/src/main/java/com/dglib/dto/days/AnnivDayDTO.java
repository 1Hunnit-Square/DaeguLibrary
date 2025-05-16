package com.dglib.dto.days;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnivDayDTO {

	private Long annivNo;
	private LocalDate annivDate;
	private String annivType;
	private String annivName;
}
