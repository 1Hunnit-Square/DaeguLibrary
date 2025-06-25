package com.dglib.service.days;

import java.time.LocalDate;
import java.util.List;

import com.dglib.dto.days.ClosedDayDTO;

public interface ClosedDayService {
	
	LocalDate registerClosedDay(ClosedDayDTO dto); // 수동 등록(자체휴관일)
	
	ClosedDayDTO get(LocalDate date); // 단일 조회
	
	ClosedDayDTO getByChat(LocalDate date); // 챗봇용 단일 조회
	
	List<ClosedDayDTO> getWeeklyList(LocalDate start, LocalDate end); // 특정 주간 조회
	
	List<ClosedDayDTO> getMonthlyList(int year, int month); // 특정 연월 전체 조회
	
	void update(String originalDate, ClosedDayDTO dto); // 수정
	
	void delete(LocalDate date); // 삭제
	
//	void deleteAllClosedDays(); // 전체 삭제(테스트용)

	
	// 자동 등록 메서드
	
	void registerMondays(int year); // 정기 휴관일: 매주 월요일
	
	void registerHolidays(int year); // 공휴일 등록(설날, 추석은 당일만)
	
	void registerLibraryAnniversary(int year); // 개관일 등록(매년 7월 8일)	
	
	void registerAllAutoEventsForYear(int year); // 연도별 자동 등록

}
