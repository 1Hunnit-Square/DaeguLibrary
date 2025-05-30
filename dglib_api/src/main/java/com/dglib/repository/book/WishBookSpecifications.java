package com.dglib.repository.book;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.AdminWishBookSearchDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.book.WishBook;
import com.dglib.entity.book.WishBookState;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;



public class WishBookSpecifications {
	
	public static Specification<WishBook> wbFilter(int year, String mid, WishBookState state) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();
			Expression<Integer> yearExpression = criteriaBuilder.function("YEAR", Integer.class, root.get("appliedAt"));
			predicates.add(criteriaBuilder.equal(yearExpression, year));
			predicates.add(criteriaBuilder.equal(root.get("member").get("mid"), mid));
			predicates.add(criteriaBuilder.notEqual(root.get("state"), state));
		

			return criteriaBuilder.and(predicates.toArray(Predicate[] :: new));
		};
	}
	
	public static Specification<WishBook> wsFilter(AdminWishBookSearchDTO dto) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

  
            if (dto.getQuery() != null && !dto.getQuery().isEmpty()) {
                String option = dto.getOption();
                String searchQuery  = dto.getQuery();
                
                switch (option) {
                	case "회원ID":
						predicates.add(criteriaBuilder.like(root.get("member").get("mid"), "%" + searchQuery + "%"));
						break;
                    case "도서명":
                        predicates.add(criteriaBuilder.like(root.get("bookTitle"), "%" + searchQuery  + "%"));
                        break;
                    case "ISBN":
                    	predicates.add(criteriaBuilder.like(
                    			root.get("isbn"), "%" + searchQuery  + "%"));
                    	break;
                }
            }
            
            
            if (dto.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("appliedAt"), dto.getStartDate()));
            }
            
            if (dto.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("appliedAt"), dto.getEndDate()));
            }
            
            if (dto.getCheck() != null) {
            	if (dto.getCheck().equals("처리중")) {
                    predicates.add(criteriaBuilder.equal(root.get("state"), WishBookState.APPLIED));
                }
            }
            
        
           
            

            
            
  
            
            return criteriaBuilder.and(predicates.toArray(Predicate[] :: new));
        };
    }

}
