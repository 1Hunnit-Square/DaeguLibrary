package com.dglib.dto.book;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class HighlightResponseDTO {
	private Long highlightId;
    private String key;
    private String color;
    private String paragraphCfi;
    private String cfiRange;
    private String chapterName;
    private Integer pageNum;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
