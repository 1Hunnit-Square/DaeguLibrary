package com.dglib.service.notice;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.dto.notice.NoticeDetailDTO;
import com.dglib.dto.notice.NoticeListDTO;
import com.dglib.dto.notice.NoticeModDTO;
import com.dglib.dto.notice.NoticeSearchDTO;

public interface NoticeService {
	
	void register(NoticeDTO dto, List<MultipartFile> files, String dirName); //등록
	void update(Long ano, NoticeModDTO dto, List<MultipartFile> files, String dirName); //수정
	NoticeDetailDTO getDetail(Long ano); //상세 조회
	Page<NoticeListDTO> findAll (NoticeSearchDTO searchDTO, Pageable pageable);
	List<NoticeListDTO> findPinned();
	List<NoticeListDTO> findTop(int count);
	void delete(Long ano); //삭제
	
}


