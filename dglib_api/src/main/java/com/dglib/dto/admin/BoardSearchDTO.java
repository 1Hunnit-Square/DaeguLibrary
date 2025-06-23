package com.dglib.dto.admin;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BoardSearchDTO {
	private String boardType;
	
	private String searchType;      // id, name, title
    private String searchKeyword;   // 검색어
    
    private LocalDate startDate;    // 작성일 시작일
    private LocalDate endDate;      // 작성일 종료일

    private Boolean isHidden;     // 숨김글만 보기 체크 여부

    private String sortBy;          // 정렬 기준
    private String orderBy;         // asc, desc

}
