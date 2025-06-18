package com.dglib.dto.qna;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class AdminQnaSearchDTO {
	private String searchType; // "id" or "name"
	private String searchKeyword; // 검색어
	private String status; // 접수 or 완료 or 전체

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate start;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate end;
}
