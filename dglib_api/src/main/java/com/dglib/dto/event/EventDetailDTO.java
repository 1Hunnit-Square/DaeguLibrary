package com.dglib.dto.event;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class EventDetailDTO {
	private String title;
	private String content;
	private boolean isPinned;
	private int viewCount;
	private String name;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private List<EventImageDTO> imageDTO;
}
