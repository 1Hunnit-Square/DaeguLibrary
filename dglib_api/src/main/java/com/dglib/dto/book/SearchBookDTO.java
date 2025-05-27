package com.dglib.dto.book;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SearchBookDTO {
	private Page<BookSummaryDTO> books;
    private List<String> keywords;
}
