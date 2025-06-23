package com.dglib.service.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;

public interface AdminNewsService {
	Page<BoardListDTO> getList(BoardSearchDTO dto, Pageable pageable);
}
