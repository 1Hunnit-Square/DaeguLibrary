package com.dglib.entity.program;

import java.time.LocalDateTime;

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
import lombok.Setter;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProgramUse {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long progUseNo; // 프로그램번호

	@Column(nullable = false)
	private LocalDateTime applyAt; // 프로그램 신청일

	// FK 프로그램 정보 id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "progNo", nullable = false)
	private ProgramInfo programInfo;

	// FK 회원id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
	private Member member;
}
