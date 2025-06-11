package com.dglib.repository.event;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.event.EventSearchDTO;
import com.dglib.entity.event.Event;

public class EventSpecifications {
	public static Specification<Event> fromDTO(EventSearchDTO dto) {
		return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
				.and((root, query, cb) -> cb.equal(root.get("isHidden"), false))
				.and((root, query, cb) -> cb.equal(root.get("isPinned"), false));
	}

	public static Specification<Event> searchFilter(String option, String queryStr) {
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
}
