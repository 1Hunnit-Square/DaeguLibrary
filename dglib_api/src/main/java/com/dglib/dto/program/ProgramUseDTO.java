package com.dglib.dto.program;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProgramUseDTO {

	private Long progUseNo;	//프로그램번호
	private LocalDateTime applyAt;	//프로그램 신청일
	private Long progNo;	//프로그램 정보
	private String memberId;	//신청자 ID
	
	
}
