package com.dglib.repository.book;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.entity.book.InterestedBook;

import jakarta.persistence.criteria.Predicate;

public class InterestedBookSpecifications {
	
	public static Specification<InterestedBook> ibFilter(InterestedBookRequestDTO dto, String mid) {
		return (root, criteriaQuery, criteriaBuilder) -> {
			Predicate predicate = criteriaBuilder.equal(root.get("member").get("mid"), mid);
			
			
			if (dto.getQuery() == null || dto.getQuery().isEmpty()) {
				return predicate;
			}
			Predicate queryPredicate;

	        switch (dto.getOption()) {
	        	
	            case "제목":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("libraryBook").get("book").get("bookTitle"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "저자":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("libraryBook").get("book").get("author"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "출판사":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("libraryBook").get("book").get("publisher"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "전체":
				queryPredicate = criteriaBuilder.or(
						criteriaBuilder.like(root.get("libraryBook").get("book").get("bookTitle"),
								"%" + dto.getQuery() + "%"),
						criteriaBuilder.like(root.get("libraryBook").get("book").get("author"),
								"%" + dto.getQuery() + "%"),
						criteriaBuilder.like(root.get("libraryBook").get("book").get("publisher"),
								"%" + dto.getQuery() + "%"));
				break;
	            default:
	                queryPredicate = criteriaBuilder.conjunction();
	        }

	        return criteriaBuilder.and(predicate, queryPredicate);
	    };
		
	}

}
