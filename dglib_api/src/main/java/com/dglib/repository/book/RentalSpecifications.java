package com.dglib.repository.book;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class RentalSpecifications {

    public static Specification<Rental> rsFilter(BorrowedBookSearchDTO dto) {
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
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("rentStartDate"), dto.getStartDate()));
            }
            
            if (dto.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("rentStartDate"), dto.getEndDate()));
            }
            
            
            if (dto.getCheck() != null) {
                if (dto.getCheck().equals("대출중")) {
                    predicates.add(criteriaBuilder.equal(root.get("state"), RentalState.BORROWED));
                } else if (dto.getCheck().equals("연체")) {
                    predicates.add(criteriaBuilder.equal(root.get("state"), RentalState.BORROWED));
                    predicates.add(criteriaBuilder.lessThan(root.get("dueDate"), LocalDate.now()));
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}