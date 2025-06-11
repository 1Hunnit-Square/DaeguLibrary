package com.dglib.repository.book;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;

import jakarta.persistence.criteria.Predicate;

public class ReserveSpecifications {
	
    public static Specification<Reserve> rsFilter(BorrowedBookSearchDTO dto) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
  
            if (dto.getQuery() != null && !dto.getQuery().isEmpty()) {
                String option = dto.getOption();
                String searchQuery  = dto.getQuery();
                
                switch (option) {
                    case "회원ID":
                        predicates.add(criteriaBuilder.like(root.get("member").get("mid"), "%" + searchQuery  + "%"));
                        break;
                    case "도서번호":
                        predicates.add(criteriaBuilder.like(
                            root.get("libraryBook").get("libraryBookId").as(String.class),
                            "%" + searchQuery  + "%"
                        ));
                        break;
                }
            }
            
            
            if (dto.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("reserveDate"), dto.getStartDateWithTime()));
            }
            
            if (dto.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("reserveDate"), dto.getEndDateWithTime()));
            }
            
            
            if (dto.getCheck() != null) {
                if (dto.getCheck().equals("일반")) {
                    predicates.add(criteriaBuilder.equal(root.get("isUnmanned"), false));
                } else if (dto.getCheck().equals("무인")) {
                    predicates.add(criteriaBuilder.equal(root.get("isUnmanned"), true));
                    
                }
            }
            if(dto.getState() != null) {
            	if(dto.getState().equals("RESERVED")) {
                	predicates.add(criteriaBuilder.equal(root.get("state"), ReserveState.RESERVED));
                }
            }
            
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    

}
