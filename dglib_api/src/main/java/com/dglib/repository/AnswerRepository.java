package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Answer;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

}
