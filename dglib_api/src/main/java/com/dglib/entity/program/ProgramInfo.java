package com.dglib.entity.program;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
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
public class ProgramInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long progNo; // 프로그램번호

	@Column(nullable = false, length = 200)
	private String progName; // 프로그램명

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content; // 프로그램 상세 내용

	@Column(nullable = false, length = 18)
	private String teachName; // 강사명

	@Builder.Default
	@Column(nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now(); // 동록일

	@Column(nullable = false)
	private LocalDateTime applyStartAt; // 신청시작기간

	@Column(nullable = false)
	private LocalDateTime applyEndAt; // 신청종료기간

	@Column(nullable = false, length = 20)
	private String status; // 신청전 / 신청중 / 신청마감 등

	@Builder.Default
	@ElementCollection
	@CollectionTable(name = "program_days", joinColumns = @JoinColumn(name = "prog_no"))
	@Column(nullable = false)
	private List<Integer> daysOfWeek  = new ArrayList<>();

	@Column(nullable = false, length = 20)
	private String room; // 장소

	@Column(nullable = false)
	private LocalDate startDate; // 수강시작날짜

	@Column(nullable = false)
	private LocalDate endDate; // 수강종료날짜

	@Column(nullable = false)
	private LocalTime startTime; // 수강시작시간

	@Column(nullable = false)
	private LocalTime endTime; // 수강종료시간

	@Column(nullable = false, length = 20)
	private String target; // 수강대상

	@Column(nullable = false)
	private int capacity; // 수강정원

	@Column(length = 100)
	private String originalName; // 계획서 파일명

	@Column(length = 200)
	private String filePath; // 계획서경로

	@PrePersist
	public void prePersist() {
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
	}

}
