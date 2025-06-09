package com.dglib.dto.news;

import java.util.List;

import lombok.Data;

@Data
public class NewsDTO {
	private String title;
	private String content;
	private boolean isHidden;
	private boolean isPinned;
	private String mid;
	private List<String> urlList;

}
