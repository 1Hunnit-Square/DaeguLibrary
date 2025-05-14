package com.dglib.dto.notice;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

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
	
	@JsonProperty("isHidden")
	private boolean isHidden;
	
	@JsonProperty("isPinned")
	private boolean isPinned;

	
	private List<NoticeFileDTO> files; // 파일 목록
	private String memberMid;             // 작성자 ID (식별자 용도)
	private String writerName;            // 작성자 이름
}
