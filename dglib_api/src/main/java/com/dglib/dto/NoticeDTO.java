package com.dglib.dto;

import java.time.LocalDate;
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
	private LocalDate createDate;
	private LocalDate modifyDate;
	private int viewCount;
	private boolean isHidden;
	private boolean isPinned;
	
	private List<NoticeImageDTO> images; // 이미지 목록
	private String memberId;             // 작성자 ID (식별자 용도)
	private String writerName;           // 작성자 이름(표시용)
}
