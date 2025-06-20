package com.dglib.repository.news;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.news.AdminNewsSearchDTO;
import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.entity.news.News;

import jakarta.persistence.criteria.Predicate;

public class NewsSpecifications {
	public static Specification<News> fromDTO(NewsSearchDTO dto) {
		return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
				.and((root, query, cb) -> cb.equal(root.get("isHidden"), false))
				.and((root, query, cb) -> cb.equal(root.get("isPinned"), false));
	}

	public static Specification<News> searchFilter(String option, String queryStr) {
		return (root, query, cb) -> {
			if (option == null || queryStr == null) {
				return null;
			}
			switch (option) {
			case "제목":
				return cb.like(root.get("title"), "%" + queryStr + "%");

			case "내용":
				return cb.like(root.get("content"), "%" + queryStr + "%");

			default:
				return null;
			}
		};
	}
	
	public static Specification<News> adminFilter(AdminNewsSearchDTO dto) {
	    return (root, query, cb) -> {
	        List<Predicate> predicates = new ArrayList<>();

	        // searchType + searchKeyword 조합
	        if (dto.getSearchType() != null && dto.getSearchKeyword() != null && !dto.getSearchKeyword().isBlank()) {
	            switch (dto.getSearchType()) {
	                case "title":
	                    predicates.add(cb.like(root.get("title"), "%" + dto.getSearchKeyword() + "%"));
	                    break;
	                case "id":
	                    predicates.add(cb.like(root.get("member").get("mid"), "%" + dto.getSearchKeyword() + "%"));
	                    break;
	                case "name":
	                    predicates.add(cb.like(root.get("member").get("name"), "%" + dto.getSearchKeyword() + "%"));
	                    break;
	            }
	        }

	        // 작성일 조건
	        if (dto.getStartDate() != null) {
	            predicates.add(cb.greaterThanOrEqualTo(root.get("postedAt"), dto.getStartDate().atStartOfDay()));
	        }
	        if (dto.getEndDate() != null) {
	            predicates.add(cb.lessThanOrEqualTo(root.get("postedAt"), dto.getEndDate().atTime(23, 59, 59)));
	        }

	        return cb.and(predicates.toArray(new Predicate[0]));
	    };
	}
}
