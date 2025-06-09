package com.dglib.dto.place;

import lombok.Data;

@Data
public class PlaceSearchConditionDTO {
	// 관리자 화면에서 검색/정렬 조건 전달용
	private int page = 0; // 페이지 번호 (0부터 시작)
	private int size = 10; // 한 페이지당 항목 수
	private String sortBy = "appliedAt"; // 정렬 기준 (기본: 신청일시)
	private String orderBy = "desc"; // 정렬 방향 (asc / desc)

	private String startDate; // 신청 시작일
	private String endDate; // 신청 종료일
	private String mid; // 회원 ID 검색
	private String name; // 회원 이름 검색
	private String room; // 장소명 (세미나실, 동아리실 등)

	private String option;
	private String query;
}
