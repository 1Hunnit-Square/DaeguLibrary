package com.dglib.dto.news;

import lombok.Data;

@Data
public class NewsDTO {
	private String title;
	private String content;
	private boolean isHidden;
	private boolean isPinned;
	private String mid;

}
