package com.dglib.dto.book;

import lombok.Data;

@Data
public class HighlightRequestDTO {
	private Long ebookId;
    private String key;
    private String color;
    private String paragraphCfi;
    private String cfiRange;
    private String chapterName;
    private Integer pageNum;
    private String content;

}
