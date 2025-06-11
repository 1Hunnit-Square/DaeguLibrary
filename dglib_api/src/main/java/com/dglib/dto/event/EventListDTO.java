package com.dglib.dto.event;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EventListDTO {
	private Long eno;
	private String title;
	private boolean isPinned;
	private String name;
	private LocalDateTime postedAt;
	private int viewCount;
}
