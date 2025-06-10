package com.dglib.repository.news;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.entity.news.News;

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

			case "작성자":
				return cb.like(root.get("member").get("name"), "%" + queryStr + "%");

			default:
				return null;
			}
		};
	}
}
