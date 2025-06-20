package com.dglib.service.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;

public interface AdminNoticeService {
	Page<BoardListDTO> getAdminNoticeList(BoardSearchDTO searchDTO, Pageable pageable);

}
