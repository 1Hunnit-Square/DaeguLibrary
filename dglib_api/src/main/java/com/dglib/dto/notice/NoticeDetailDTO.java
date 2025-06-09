package com.dglib.dto.notice;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class NoticeDetailDTO {
	
	private String title;
	private String content;
	private boolean isPinned;
	private int viewCount;
	private String name;
	private String writerMid;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private List<NoticeFileDTO> fileDTO;
	

}
