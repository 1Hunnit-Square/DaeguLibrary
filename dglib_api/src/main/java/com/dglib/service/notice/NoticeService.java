package com.dglib.service.notice;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.notice.NoticeDTO;

public interface NoticeService {
	
	Long registerNotice(NoticeDTO dto); //등록
	NoticeDTO get(Long ano); //조회
	Page<NoticeDTO> getList(Pageable pageable, String keyword); //목록 조회
	void update(Long ano, NoticeDTO dto); // 수정
	void delete(Long ano); //삭제
	
}


