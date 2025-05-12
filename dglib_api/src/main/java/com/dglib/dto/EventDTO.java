package com.dglib.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
	
	private Long eno;
	private String title;
	private String content;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private int viewCount;
	private boolean isHidden;
	private boolean isPinned;
	
	private String memberId;
	
	private List<EventImageDTO> images;

}
