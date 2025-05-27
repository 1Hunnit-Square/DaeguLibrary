package com.dglib.service.place;

import java.util.List;

import com.dglib.dto.place.PlaceDTO;
import com.dglib.dto.place.ReservationStatusDTO;

public interface PlaceService {
	
	Long registerPlace(PlaceDTO dto);
	PlaceDTO get(Long pno);
	void delete(Long pno);
	List<PlaceDTO> getListByMember(String mid);
	List<ReservationStatusDTO> getMonthlyRoomStatus(int year, int month);

	
}
