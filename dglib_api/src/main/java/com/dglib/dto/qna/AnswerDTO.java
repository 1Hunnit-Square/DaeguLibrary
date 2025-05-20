package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnswerDTO {
	
	private Long ano;	//답변글 번호
	private Long qno;	//질문글 번호
	private LocalDateTime postedAt;	//등록일
	private LocalDateTime modifiedAt;	//수정일	
	private String content;	//내용
	
	private String memberMid;	//회원id
}
