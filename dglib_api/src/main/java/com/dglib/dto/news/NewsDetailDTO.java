package com.dglib.dto.news;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class NewsDetailDTO {
	private String title;
	private String content;
	private boolean isPinned;
	private int viewCount;
	private String name;
	private LocalDateTime postedAt;
	private List<NewsFileDTO> fileDTO;
	
}
