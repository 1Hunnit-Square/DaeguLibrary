package com.dglib.repository.qna;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.entity.qna.Question;

import jakarta.persistence.criteria.Predicate;

public class QuestionSpecifications {

	public static Specification<Question> fromDTO(QuestionSearchDTO dto){
		return Specification.where(searchFilter(dto.getQuery(), dto.getOption(), dto.getRequesterMid()));
	}
	
	public static Specification<Question> searchFilter(String queryStr, String option, String requesterMid) {
		return (root, query, cb) -> {
			if (option == null || queryStr == null) {
				return null;
			}

			Predicate canView = cb.or(
					cb.isTrue(root.get("checkPublic")),
					cb.equal(root.get("member").get("mid"), requesterMid)
					);

			Predicate searchCondition;
			switch (option) {
			case "제목":
				searchCondition = cb.like(root.get("title"), "%" + queryStr + "%");
				break;
			case "내용":
				searchCondition = cb.like(root.get("content"), "%" + queryStr + "%");
				break;
			case "작성자":
				searchCondition = cb.like(root.get("member").get("name"), "%" + queryStr + "%");
				break;
			default:
				return null;
			}

			return cb.and(searchCondition, canView);
		};

	}
}
