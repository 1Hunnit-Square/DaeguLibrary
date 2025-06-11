package com.dglib.dto.event;

import java.util.List;

import lombok.Data;

@Data
public class EventUpdateDTO {
	 private String title;
	    private String content;
	    private boolean pinned;
	    private boolean hidden;
	    private String mid;

	    private List<String> urlList;
	    private List<String> oldFiles;
}
