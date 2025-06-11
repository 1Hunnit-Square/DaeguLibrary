package com.dglib.repository.book;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.EbookListRequestDTO;
import com.dglib.dto.book.EbookMemberRequestDTO;
import com.dglib.dto.book.EbookSearchDTO;
import com.dglib.entity.book.Ebook;
import com.dglib.entity.book.EbookReadingProgress;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class EbookSpecifications {
	
	public static Specification<Ebook> esFilter(EbookSearchDTO dto) {
		
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

  
            if (dto.getQuery() != null && !dto.getQuery().isEmpty()) {
                String option = dto.getOption();
                String searchQuery  = dto.getQuery();
                
                switch (option) {
                    case "도서명":
                        predicates.add(criteriaBuilder.like(root.get("ebookTitle"), "%" + searchQuery  + "%"));
                        break;
                    case "저자":
                        predicates.add(criteriaBuilder.like(
                            root.get("ebookAuthor"),
                            "%" + searchQuery  + "%"));
                        break;
                    case "ISBN":
                    	predicates.add(criteriaBuilder.like(
                    			root.get("ebookIsbn"), "%" + searchQuery  + "%"));
                    	break;
                }
            }
            
            
            if (dto.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("ebookRegDate"), dto.getStartDate()));
            }
            
            if (dto.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("ebookRegDate"), dto.getEndDate()));
            }
            

            
            
  
            
            return criteriaBuilder.and(predicates.toArray(Predicate[] :: new));
        };
    }
	
	public static Specification<Ebook> meFilter(EbookMemberRequestDTO dto, String mid) {


		return (root, criteriaQuery, criteriaBuilder) -> {
			Join<Object, Object> progressJoin = root.join("readingProgressList", JoinType.INNER);
	        Join<Object, Object> memberJoin = progressJoin.join("member", JoinType.INNER);
	        Predicate predicate = criteriaBuilder.equal(memberJoin.get("mid"), mid);
	        criteriaQuery.distinct(true);
	        criteriaQuery.orderBy(criteriaBuilder.desc(root.get("ebookId")));
			if (dto.getQuery() == null || dto.getQuery().isEmpty()) {
				return predicate;
			}
			Predicate queryPredicate;

	        switch (dto.getOption()) {
	        	
	            case "제목":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("ebookTitle"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "저자":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("ebookAuthor"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "출판사":
	                queryPredicate = criteriaBuilder.like(
	                    root.get("ebookPublisher"),
	                    "%" + dto.getQuery() + "%"
	                );
	                break;
	            case "전체":
				queryPredicate = criteriaBuilder.or(
						criteriaBuilder.like(root.get("ebookTitle"),
								"%" + dto.getQuery() + "%"),
						criteriaBuilder.like(root.get("ebookAuthor"),
								"%" + dto.getQuery() + "%"),
						criteriaBuilder.like(root.get("ebookPublisher"),
								"%" + dto.getQuery() + "%"));
				break;
	            default:
	                queryPredicate = criteriaBuilder.conjunction();
	        }
	        

	        return criteriaBuilder.and(predicate, queryPredicate);
	    };
		
	}
	
	public static Specification<Ebook> elFilter(EbookListRequestDTO dto) {
		return (root, criteriaQuery, criteriaBuilder) -> {
			if (dto.getQuery() == null || dto.getQuery().isEmpty()) {
				return criteriaBuilder.conjunction();
			}
			Predicate queryPredicate;
			switch (dto.getOption()) {
        	
            case "제목":
                queryPredicate = criteriaBuilder.like(
                    root.get("ebookTitle"),
                    "%" + dto.getQuery() + "%"
                );
                break;
            case "저자":
                queryPredicate = criteriaBuilder.like(
                    root.get("ebookAuthor"),
                    "%" + dto.getQuery() + "%"
                );
                break;
            case "출판사":
                queryPredicate = criteriaBuilder.like(
                    root.get("ebookPublisher"),
                    "%" + dto.getQuery() + "%"
                );
                break;
            case "전체":
			queryPredicate = criteriaBuilder.or(
					criteriaBuilder.like(root.get("ebookTitle"),
							"%" + dto.getQuery() + "%"),
					criteriaBuilder.like(root.get("ebookAuthor"),
							"%" + dto.getQuery() + "%"),
					criteriaBuilder.like(root.get("ebookPublisher"),
							"%" + dto.getQuery() + "%"));
			break;
            default:
                queryPredicate = criteriaBuilder.conjunction();
        }
        

        return criteriaBuilder.and(queryPredicate);
    };
}
}
	
	


