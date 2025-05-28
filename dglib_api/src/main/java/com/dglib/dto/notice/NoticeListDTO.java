package com.dglib.dto.notice;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NoticeListDTO {
	private Long index;
	private Long ano;
	private String title;
	private String content;
	private boolean isPinned;
	private String name;
	private LocalDateTime postedAt;
	private int viewCount;
}
