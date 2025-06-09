package com.dglib.dto.notice;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

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
public class NoticeModDTO {
	private String title;
	private String content;
	private boolean isPinned;
	private String mid;             // 작성자 ID (식별자 용도)
	private List<String> urlList;
	private List<String> oldFiles;
}
