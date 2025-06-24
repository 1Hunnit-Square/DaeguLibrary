package com.dglib.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;

public interface AdminBoardService {
	Page<BoardListDTO> getNewsList(BoardSearchDTO dto, Pageable pageable);

	Page<BoardListDTO> getNoticeList(BoardSearchDTO dto, Pageable pageable);
	
	Page<BoardListDTO> getEventList(BoardSearchDTO dto, Pageable pageable);
	
	Page<BoardListDTO> getGalleryList(BoardSearchDTO dto, Pageable pageable);

	void hideBoards(String boardType, List<Long> ids, boolean isHidden);

	void deleteBoards(String boardType, List<Long> ids);

}
