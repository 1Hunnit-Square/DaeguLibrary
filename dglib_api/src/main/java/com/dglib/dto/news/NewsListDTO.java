package com.dglib.dto.news;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NewsListDTO {

	private Long nno;
	private String title;
	private boolean isPinned;
	private String name;
	private LocalDateTime postedAt;
	private int viewCount;

}
