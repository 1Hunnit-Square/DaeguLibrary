package com.dglib.dto.notice;

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
public class NoticeDetailDTO {
	
	private String title;
	private String content;
	private boolean isPinned;
	private int viewCount;
	private String mid;
	private LocalDateTime postedAt;
	private List<NoticeFileDTO> fileDTO;
	

}
