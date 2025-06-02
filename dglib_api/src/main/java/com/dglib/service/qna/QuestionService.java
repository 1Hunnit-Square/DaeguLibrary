package com.dglib.service.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.qna.QuestionDetailDTO;
import com.dglib.dto.qna.QuestionListDTO;
import com.dglib.dto.qna.QuestionNewDTO;
import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.dto.qna.QuestionUpdateDTO;

import jakarta.servlet.http.HttpSession;

public interface QuestionService {

	//등록
	Long newQuestion(QuestionNewDTO newDTO);
	
	//목록 및 검색
	Page<QuestionListDTO> findAll(QuestionSearchDTO searchDTO, Pageable pageable, String requesterMid);
	
	//상세보기
	QuestionDetailDTO getQuestion(Long qno, String requesterMid);
	
	//수정
	void update(Long qno, QuestionUpdateDTO dto);
	
	//삭제
	void delete(Long qno, String requesterMid);
	
	//조회수증가
	void increaseViewCount(Long qno, HttpSession session);
}
