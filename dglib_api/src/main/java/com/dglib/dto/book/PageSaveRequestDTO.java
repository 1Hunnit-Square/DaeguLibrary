package com.dglib.dto.book;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PageSaveRequestDTO {
	
	private Long ebookId;
	private String startCfi;

}
