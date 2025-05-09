package com.dglib.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;



@Getter @Setter
public class PlaceDTO {
	
	private long pno;	//시설 신청 번호
	private LocalDate useDate;	//이용날짜
	private LocalTime startTime;	//시작시간
	private int durationTime;	//지속시간(1~3)
	private String room;	//동아리실, 세미나실
	private int people;	//이용인원
	private LocalDateTime appliedAt;	//신청날짜
	private String memberId;	//회원id
	
}
