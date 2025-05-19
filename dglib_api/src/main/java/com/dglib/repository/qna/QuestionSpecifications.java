package com.dglib.repository.qna;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.entity.qna.Question;

import jakarta.persistence.criteria.Predicate;

public class QuestionSpecifications {

    public static Specification<Question> searchFilter(String query, String option, String requesterMid) {
        return (root, criteriaQuery, cb) -> {
            if (query == null || query.isBlank()) return cb.conjunction();

            Predicate isPublic = cb.isTrue(root.get("checkPublic"));
            Predicate isOwner = cb.equal(root.get("member").get("mid"), requesterMid);
            Predicate canView = cb.or(isPublic, isOwner);

            switch (option) {
                case "제목":
                    return cb.like(root.get("title"), "%" + query + "%");
                case "내용":
                    return cb.and(cb.like(root.get("content"), "%" + query + "%"), canView);
                case "작성자":
                    return cb.and(cb.like(root.get("member").get("name"), "%" + query + "%"), canView);
            
                default:
                    return cb.conjunction();
            }
        };
    }
}