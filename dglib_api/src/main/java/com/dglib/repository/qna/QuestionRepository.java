package com.dglib.repository.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.dglib.dto.qna.QuestionDTO;
import com.dglib.entity.qna.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
	
	@Query("""
			SELECT new com.dglib.dto.qna.QuestionDTO(
				q.qno,
				q.title,
				q.content,
				CASE WHEN q.answer IS NULL THEN '접수' ELSE '완료' END
			)
			FROM Question q
			LEFT JOIN Answer a ON a.question.qno = q.qno
			""")
	
	Page<QuestionDTO> findAllWithStatus(Pageable pageable);
	
	
	
}
