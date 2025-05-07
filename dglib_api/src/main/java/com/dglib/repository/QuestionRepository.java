package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
