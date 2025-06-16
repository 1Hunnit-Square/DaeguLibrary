package com.dglib.dto.place;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {

	private Long pno; // 시설 신청 번호
	private LocalDate useDate; // 이용날짜
	@JsonFormat(pattern = "HH:mm")
	private LocalTime startTime; // 시작시간
	private int durationTime; // 지속시간(1~3)
	private String room; // 동아리실, 세미나실
	private int people; // 이용인원
	private LocalDateTime appliedAt; // 신청날짜
	private String participants; // 참가자 명단
	private String purpose; // 사용목적

	private String memberMid;
	private String memberName;

	@JsonFormat(pattern = "HH:mm")
	public LocalTime getEndTime() {
		return (this.startTime != null) ? this.startTime.plusHours(this.durationTime) : null;
	}
}