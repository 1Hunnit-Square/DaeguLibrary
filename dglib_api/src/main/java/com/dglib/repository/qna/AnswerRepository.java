package com.dglib.repository.qna;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.qna.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

}
