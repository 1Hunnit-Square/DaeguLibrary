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
public class NewsDTO {
	
	private Long nno;
	private String title;
	private String content;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private int viewCount;
	private boolean isHidden;
	private boolean isPinned;
	
	private String memberMid;
	
	private List<NewsImageDTO> images;
	
	

}
