package com.dglib.service.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.qna.QuestionDTO;
import com.dglib.entity.qna.Question;

public interface QuestionService {

	Long createQuestion(QuestionDTO questionDto);
	QuestionDTO getQuestion(Long qno, String requesterMid);
	void updateQuestion(Long qno, QuestionDTO dto);
	void deleteQuestion(Long qno, String requesterMid);
	Page<QuestionDTO> getQuestionsWithStatus(Pageable pageable, String requesterMid);
	Page<QuestionDTO> getQuestionsWithSpecification(Specification<Question> spec, Pageable pageable, String requesterMid);
	
}
