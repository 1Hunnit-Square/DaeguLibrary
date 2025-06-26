package com.dglib.repository.qna;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.qna.AdminQnaSearchDTO;
import com.dglib.entity.qna.Question;

import jakarta.persistence.criteria.Predicate;

public class AdminQnaSpecifications {

	public static Specification<Question> search(AdminQnaSearchDTO dto) {
		return (root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (dto.getSearchType() != null && dto.getSearchKeyword() != null) {
				switch (dto.getSearchType()) {
				case "id" -> predicates.add(cb.like(root.get("member").get("mid"), "%" + dto.getSearchKeyword() + "%"));
				case "name" ->
					predicates.add(cb.like(root.get("member").get("name"), "%" + dto.getSearchKeyword() + "%"));
				case "title" -> predicates.add(cb.like(root.get("title"), "%" + dto.getSearchKeyword() + "%"));
				}
			}

			if (dto.getStatus() != null && !dto.getStatus().equals("전체")) {
				predicates.add(cb.equal(root.get("status"), dto.getStatus()));
			}

			if (dto.getStart() != null && dto.getEnd() != null) {
				predicates.add(cb.between(root.get("postedAt"), dto.getStart(), dto.getEnd().plusDays(1)));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}

}
