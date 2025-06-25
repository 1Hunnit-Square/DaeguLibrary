package com.dglib.dto.admin;

import java.util.List;

import lombok.Data;

@Data
public class BoardTypeDTO {
	private String boardType;
	private List<Long> ids; // 게시글 번호 리스트
	private boolean hidden;	//숨김여부
}
