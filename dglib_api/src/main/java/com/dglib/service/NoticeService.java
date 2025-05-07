package com.dglib.service;

import java.util.List;

import com.dglib.dto.NoticeDTO;
import com.dglib.entity.Member;

public interface NoticeService {
	void register(NoticeDTO dto, Member member); //등록
	void update(Long ano, NoticeDTO dto); //수정
	NoticeDTO get(Long ano); //상세 조회
	List<NoticeDTO> getList(); //목록 조회
	void delete(Long ano); //삭제
	
}
