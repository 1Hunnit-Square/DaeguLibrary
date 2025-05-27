package com.dglib.repository.qna;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.entity.qna.Question;

import jakarta.persistence.criteria.Predicate;

public class QuestionSpecifications {

	public static Specification<Question> searchFilter(String query, String option, String requesterMid) {
	    return (root, criteriaQuery, cb) -> {
	        if (query == null || query.isBlank()) {
	            // 비어 있으면 공개 또는 작성자만 조회
	            Predicate isPublic = cb.isTrue(root.get("checkPublic"));
	            Predicate isOwner = cb.equal(root.get("member").get("mid"), requesterMid);
	            return cb.or(isPublic, isOwner);
	        }

	        Predicate canView = cb.or(
	            cb.isTrue(root.get("checkPublic")),
	            cb.equal(root.get("member").get("mid"), requesterMid)
	        );

	        Predicate searchCondition;
	        switch (option) {
	            case "제목":
	                searchCondition = cb.like(root.get("title"), "%" + query + "%");
	                break;
	            case "내용":
	                searchCondition = cb.like(root.get("content"), "%" + query + "%");
	                break;
	            case "작성자":
	                searchCondition = cb.like(root.get("member").get("name"), "%" + query + "%");
	                break;
	            default:
	                searchCondition = cb.or(
	                    cb.like(root.get("title"), "%" + query + "%"),
	                    cb.like(root.get("content"), "%" + query + "%"),
	                    cb.like(root.get("member").get("name"), "%" + query + "%")
	                );
	        }

	        return cb.and(searchCondition, canView);
	    };

	}
}
