package com.dglib.dto.event;

import java.util.List;

import lombok.Data;

@Data
public class EventDTO {
	
	private String title;
	private String content;
	private boolean isHidden;
	private boolean isPinned;
	private String mid;
	private List<String> urlList;

}
