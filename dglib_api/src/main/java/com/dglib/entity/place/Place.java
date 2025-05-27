package com.dglib.entity.place;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.dglib.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Place {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long pno;	//시설 신청 번호
	
	@Column(nullable = false)
	private LocalDate useDate;	//이용날짜
	
	@Column(nullable = false)
	private LocalTime startTime;	//시작 시간
	
	@Column(nullable = false)
	private int durationTime;	//지속시간(1~3)
	
	@Column(nullable = false, length = 20)
	private String room;	//동아리실, 세미나실
	
	@Column(nullable = false)
	private int people;	//이용인원
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String participants;	       //참가자 명단
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String purpose;	       //사용목적
	
	@Column(nullable = false)
	private LocalDateTime appliedAt;	//신청날짜
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;	//회원id
	
	//종료시간
	public LocalTime getEndTime() {
		return this.startTime.plusHours(this.durationTime);
	}

	
	
	
	
	
}
