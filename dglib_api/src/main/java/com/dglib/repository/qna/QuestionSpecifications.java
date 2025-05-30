package com.dglib.repository.qna;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.entity.qna.Question;

import jakarta.persistence.criteria.Predicate;

public class QuestionSpecifications {

    public static Specification<Question> fromDTO(QuestionSearchDTO dto) {
        // 검색어X
        if (dto.getQuery() == null || dto.getOption() == null || dto.getQuery().isBlank()) {
            return null;  // 전체 출력
        }

        // 검색어O
        return Specification.where(searchFilter(dto.getQuery(), dto.getOption()))
                .and(canView(dto.getRequesterMid()));
    }

    public static Specification<Question> canView(String requesterMid) {
        return (root, query, cb) -> cb.or(
                cb.isTrue(root.get("checkPublic")),
                cb.equal(root.get("member").get("mid"), requesterMid)
        );
    }

    public static Specification<Question> searchFilter(String queryStr, String option) {
        return (root, query, cb) -> {
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

            return searchCondition;
        };
    }
}
