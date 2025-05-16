package com.dglib.service.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.qna.QuestionDTO;

public interface QuestionService {

	Long createQuestion(QuestionDTO questionDto);
	QuestionDTO getQuestion(Long qno);
	void updateQuestion(Long qno, QuestionDTO dto);
	void deleteQuestion(Long qno, String requesterMid);
	Page<QuestionDTO> getQuestions(Pageable pageable);
	Page<QuestionDTO> getQuestionsWithStatus(Pageable pageable, String requesterMid);
	
	
}
