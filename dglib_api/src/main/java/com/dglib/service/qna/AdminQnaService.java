package com.dglib.service.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.qna.AdminQnaDTO;
import com.dglib.dto.qna.AdminQnaSearchDTO;

public interface AdminQnaService {
	    Page<AdminQnaDTO> findAll(AdminQnaSearchDTO searchDTO, Pageable pageable, String requesterMid);
}
