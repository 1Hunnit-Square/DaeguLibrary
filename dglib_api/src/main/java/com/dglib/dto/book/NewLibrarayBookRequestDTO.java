package com.dglib.dto.book;

import java.time.LocalDate;

import lombok.Data;

@Data
public class NewLibrarayBookRequestDTO {
	private LocalDate startDate;
	private LocalDate endDate;
}
