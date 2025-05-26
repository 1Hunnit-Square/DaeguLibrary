package com.dglib.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter
@NoArgsConstructor
public class QuestionDTO {
    private Long qno;              // 글 번호
    private String title;          // 제목
    private String content;        // 본문
    private Boolean checkPublic;   // 공개 여부
    private LocalDateTime postedAt;     // 등록일
    private LocalDateTime modifiedAt;   // 수정일
    private int viewCount;         // 조회 수
    private String memberMid;      // 작성자 ID (기존 구조 호환용)
    private String status;         // 질문 상태: 접수 or 완료
    private AnswerDTO answer;      // 답변 DTO

    //추가된 필드
    private String writerId;       // 실제 로그인 ID
    private String writerName;     // 작성자 이름 (또는 마스킹 이름)
    
    public QuestionDTO(Long qno, String title, String content, String status) {
        this.qno = qno;
        this.title = title;
        this.content = content;
        this.status = status;
    }
}
