package com.dglib.service.days;

import java.util.List;

import com.dglib.dto.days.ClosedDayDTO;

public interface ClosedDayService {
	
	Long registerClosedDay(ClosedDayDTO dto);
	ClosedDayDTO get(Long closedId);
	List<ClosedDayDTO> getMonthlyList(int year, int month);
	void delete(Long closedId);
	List<Long> registerMondays(int year, int month); // 월요일 등록(정기 휴관일)
	List<Long> registerHolidays(int year); // 전체 휴관일 등록(월요일, 명절당일(수동), 개관일)


}
