package com.dglib.repository.book;
import java.util.ArrayList;
import java.util.List;

import java.util.stream.IntStream;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.persistence.criteria.Predicate;

import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;


public class LibraryBookSpecifications {
	
	public static Specification<LibraryBook> notDeleted() {
	    return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
	}

	public static Specification<LibraryBook> nsFilter(String query, String option) {
	    return (root, criteriaQuery, criteriaBuilder) -> {
	    	Predicate basePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
	        if (query == null || query.isEmpty()) {
	            return basePredicate; 
	        }

	        Predicate searchPredicate;
	        
	        switch (option) {
            case "제목":
                searchPredicate = criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + query + "%");
                break;
            case "저자":
                searchPredicate = criteriaBuilder.like(root.get("book").get("author"), "%" + query + "%");
                break;
            case "출판사":
                searchPredicate = criteriaBuilder.like(root.get("book").get("publisher"), "%" + query + "%");
                break;
            case "전체":
                searchPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + query + "%"),
                    criteriaBuilder.like(root.get("book").get("author"), "%" + query + "%"),
                    criteriaBuilder.like(root.get("book").get("publisher"), "%" + query + "%")
                );
                break;
            default:
                searchPredicate = criteriaBuilder.conjunction();
        }

        return criteriaBuilder.and(basePredicate, searchPredicate);
	        
	    };
	}
	
	public static Specification<LibraryBook> fsFilter(LibraryBookFsDTO dto) {
		return (root, criteriaQuery, criteriaBuilder) -> {
			Predicate basePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
			List<Predicate> predicates = new ArrayList<>(); 
			if (dto.getTitle() != null && !dto.getTitle().isEmpty()) {
				predicates.add(criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + dto.getTitle() + "%"));
			}
			if (dto.getIsbn() != null && !dto.getIsbn().isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("book").get("isbn"), "%" + dto.getIsbn() + "%"));
            }
			if (dto.getAuthor() != null && !dto.getAuthor().isEmpty()) {
				predicates.add(criteriaBuilder.like(root.get("book").get("author"), "%" + dto.getAuthor() + "%"));
            }
			if (dto.getYearStart() != null && !(dto.getYearStart() == null)) {
				predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("book").get("pubDate"), dto.getYearStartDate()));
			}
			if (dto.getYearEnd() != null && !(dto.getYearEnd() == null)) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("book").get("pubDate"), dto.getYearEndDate()));
            }
			if (dto.getPublisher() != null && !dto.getPublisher().isEmpty()) {
				predicates.add(criteriaBuilder.like(root.get("book").get("publisher"), "%" + dto.getPublisher() + "%"));
			}
			if (dto.getKeyword() != null && !dto.getKeyword().isEmpty()) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + dto.getKeyword() + "%"),
                        criteriaBuilder.like(root.get("book").get("author"), "%" + dto.getKeyword() + "%"),
                        criteriaBuilder.like(root.get("book").get("publisher"), "%" + dto.getKeyword() + "%"),
                        criteriaBuilder.like(root.get("book").get("description"), "%" + dto.getKeyword() + "%")
                ));
			}
			if (dto.getSortBy() != null && !dto.getSortBy().isEmpty()) {
	               if (dto.getOrderBy() != null && dto.getOrderBy().equals("desc")) {
	                   criteriaQuery.orderBy(criteriaBuilder.desc(root.get("book").get(dto.getSortBy())));
	               } else {
	                   criteriaQuery.orderBy(criteriaBuilder.asc(root.get("book").get(dto.getSortBy())));
	               }
	        }
			predicates.add(basePredicate); 
			return criteriaBuilder.and(predicates.toArray(Predicate[] :: new));
		};
            
	}
	
	
	public static Specification<LibraryBook> research(String query, String option, List<String> previousQueries, List<String> previousOptions) {
		Specification<LibraryBook> spec = nsFilter(query, option);
		if (previousQueries != null && !previousQueries.isEmpty()) {
	        Specification<LibraryBook> prevSpec = IntStream.range(0, previousQueries.size())
	                .mapToObj(i -> nsFilter(previousQueries.get(i), previousOptions.get(i)))
	                .reduce(Specification::and)
	                .orElse(null);
	        if (prevSpec != null) {
	            spec = spec.and(prevSpec);
	        }
		}

		

	    
		return spec;
	}
	
	public static Specification<LibraryBook> lsFilter(LibraryBookSearchDTO dto) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

  
            if (dto.getQuery() != null && !dto.getQuery().isEmpty()) {
                String option = dto.getOption();
                String searchQuery  = dto.getQuery();
                
                switch (option) {
                    case "도서명":
                        predicates.add(criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + searchQuery  + "%"));
                        break;
                    case "저자":
                        predicates.add(criteriaBuilder.like(
                            root.get("book").get("author"),
                            "%" + searchQuery  + "%"));
                        break;
                    case "ISBN":
                    	predicates.add(criteriaBuilder.like(
                    			root.get("book").get("isbn"), "%" + searchQuery  + "%"));
                    	break;
                    case "도서번호":
                    	predicates.add(criteriaBuilder.like(root.get("libraryBookId").as(String.class), "%" + searchQuery  + "%"));
                    	break;
                }
            }
            
            
            if (dto.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("regLibraryBookDate"), dto.getStartDate()));
            }
            
            if (dto.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("regLibraryBookDate"), dto.getEndDate()));
            }
            

            
            
  
            
            return criteriaBuilder.and(predicates.toArray(Predicate[] :: new));
        };
    }
	
	
}