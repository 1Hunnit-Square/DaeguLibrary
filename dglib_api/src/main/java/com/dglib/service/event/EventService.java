package com.dglib.service.event;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.event.EventDTO;
import com.dglib.dto.event.EventDetailDTO;
import com.dglib.dto.event.EventListDTO;
import com.dglib.dto.event.EventSearchDTO;
import com.dglib.dto.event.EventUpdateDTO;

public interface EventService {

	// 등록
	void register(EventDTO dto, List<MultipartFile> images, String dirName);

	// 수정
	void update(Long eno, EventUpdateDTO dto, List<MultipartFile> images, String dirName);

	// 상세보기
	EventDetailDTO getDetail(Long eno);

	// 검색
	Page<EventListDTO> findAll(EventSearchDTO searchDTO, Pageable pageable);

	// 상단고정
	List<EventListDTO> findPinned();

	// 상위 n개
	List<EventListDTO> findTop(int count);

	// 삭제
	void delete(Long eno);
}
