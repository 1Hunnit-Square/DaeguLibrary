package com.dglib.repository.qna;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.qna.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
