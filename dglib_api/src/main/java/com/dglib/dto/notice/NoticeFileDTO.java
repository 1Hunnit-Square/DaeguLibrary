package com.dglib.dto.notice;

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
public class NoticeFileDTO {
	
	private Long fno;
	private String originalName;
	private String filePath;
	private String fileType;
	

}
