package com.dglib.service.qna;

import com.dglib.dto.qna.AnswerDTO;

public interface AnswerService {

	
	Long createAnswer(AnswerDTO answerDto);
	AnswerDTO getAnswer(Long ano);
	void updateAnswer(Long qno, AnswerDTO dto);
	void deleteAnswer(Long ano, String requesterMid);
	
}
