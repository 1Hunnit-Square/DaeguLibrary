package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter 
@Setter
@NoArgsConstructor
public class QuestionDTO {
	private Long qno;	//글번호
	private String title;	//제목	
	private String content;	//내용
	private Boolean checkPublic;	//공개, 비공개	
	private LocalDateTime postedAt;	//등록일
	private LocalDateTime modifiedAt;	//수정일
	private int viewCount;	//조회 횟수
	
	private String memberMid;	//회원id
	
	
	private String status;	//질문 현황: 접수or완료
	
	public QuestionDTO(Long qno, String title, String content, String status) {
		this.qno = qno;
		this.title = title;
		this.content = content;
		this.status = status;
	}
	
}
