package com.dglib.dto.admin;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BoardListDTO {
	private Long no;	//글id
	
	private String title;	//제목
	private LocalDateTime postedAt;	//작성일
	private LocalDateTime modifiedAt;	//수정일
	private boolean isHidden;	//숨김여부
	private boolean isPinned;	//고정여부
	private int viewCount;	//조회수
	
	private String writerId;	//작성자id
	private String name;	//작성자이름
	
}
