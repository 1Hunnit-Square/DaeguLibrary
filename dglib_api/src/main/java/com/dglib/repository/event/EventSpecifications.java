package com.dglib.repository.event;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.admin.BoardSearchDTO;
import com.dglib.dto.event.EventSearchDTO;
import com.dglib.entity.event.Event;

import jakarta.persistence.criteria.Predicate;

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

			case "작성자":
				return cb.like(root.get("member").get("name"), "%" + queryStr + "%");

			default:
				return null;
			}
		};
	}
	
	public static Specification<Event> adminFilter(BoardSearchDTO dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dto.getSearchKeyword() != null && !dto.getSearchKeyword().isEmpty()) {
                switch (dto.getSearchType()) {
                    case "id":
                        predicates.add(cb.like(root.get("writerId"), "%" + dto.getSearchKeyword() + "%"));
                        break;
                    case "name":
                        predicates.add(cb.like(root.get("name"), "%" + dto.getSearchKeyword() + "%"));
                        break;
                    case "title":
                        predicates.add(cb.like(root.get("title"), "%" + dto.getSearchKeyword() + "%"));
                        break;
                }
            }

        
            if (dto.getStartDate() != null && dto.getEndDate() != null) {
                try {
                	LocalDate start = dto.getStartDate();
                	LocalDate end = dto.getEndDate();
                    predicates.add(cb.between(
                        root.get("postedAt"), 
                        start.atStartOfDay(), 
                        end.atTime(LocalTime.MAX)
                    ));
                } catch (DateTimeParseException e) {
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
	
	public static Specification<Event> isHidden(Boolean isHidden) {
	    return (root, query, cb) -> cb.equal(root.get("isHidden"), isHidden);
	}

}
