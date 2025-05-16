package com.dglib.service.days;

import java.util.List;

import com.dglib.dto.days.AnnivDayDTO;

public interface AnnivDayService {
	
	Long registerAnnivDay(AnnivDayDTO dto);
	AnnivDayDTO get(Long annivNo);
    List<AnnivDayDTO> getAll();
    List<AnnivDayDTO> getByMonth(int year, int month);
    List<AnnivDayDTO> getDailyList(int year, int month, int day);
    void updateAnnivDay(Long annivNo, AnnivDayDTO dto);
    void delete(Long annivNo);

}
