package com.dglib.repository.qna;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.qna.Answer;
import com.dglib.entity.qna.Question;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

	boolean existsByQuestion(Question question);
}
