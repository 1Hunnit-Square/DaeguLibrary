package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class AnswerDTO {
	
	private Long ano;	//답변글 번호
	private Long qno;	//질문글 번호
	private LocalDateTime postedAt;	//등록일
	private LocalDateTime modifiedAt;	//수정일	
	private String content;	//내용
	private String adminMid;	//관리자id
}
