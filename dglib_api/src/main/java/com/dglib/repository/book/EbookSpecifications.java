package com.dglib.repository.book;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.EbookSearchDTO;
import com.dglib.entity.book.Ebook;


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

}
