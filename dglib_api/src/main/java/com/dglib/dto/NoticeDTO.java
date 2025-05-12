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
public class NoticeDTO {
	private Long ano;
	private String title;
	private String content;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private int viewCount;
	private boolean isHidden;
	private boolean isPinned;
	
	private List<NoticeFileDTO> files; // 파일 목록
	private String memberMid;             // 작성자 ID (식별자 용도)
}
