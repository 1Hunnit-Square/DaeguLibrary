package com.dglib.repository.book;
import java.util.List;
import java.util.stream.IntStream;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestParam;

import com.dglib.entity.book.LibraryBook;


public class LibraryBookSpecifications {

	public static Specification<LibraryBook> hasQuery(String query, String option) {
	    return (root, criteriaQuery, criteriaBuilder) -> {
	        if (query == null || query.isEmpty()) {
	            return criteriaBuilder.conjunction(); 
	        }

	        
	        switch (option) {
	            case "제목":
	                return criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + query + "%");
	            case "저자":
	                return criteriaBuilder.like(root.get("book").get("author"), "%" + query + "%");
	            case "출판사":
	                return criteriaBuilder.like(root.get("book").get("publisher"), "%" + query + "%");
	            case "전체":
	                return criteriaBuilder.or(
	                    criteriaBuilder.like(root.get("book").get("bookTitle"), "%" + query + "%"),
	                    criteriaBuilder.like(root.get("book").get("author"), "%" + query + "%"),
	                    criteriaBuilder.like(root.get("book").get("publisher"), "%" + query + "%")
	                );
	            default:
	                return criteriaBuilder.conjunction(); 
	        }
	    };
	}
	public static Specification<LibraryBook> research(String query, String option, List<String> previousQueries, List<String> previousOptions) {
		Specification<LibraryBook> spec = hasQuery(query, option);
		if (previousQueries != null && !previousQueries.isEmpty()) {
	        Specification<LibraryBook> prevSpec = IntStream.range(0, previousQueries.size())
	                .mapToObj(i -> hasQuery(previousQueries.get(i), previousOptions.get(i)))
	                .reduce(Specification::and)
	                .orElse(null);
	        if (prevSpec != null) {
	            spec = spec.and(prevSpec);
	        }
		}

		

	    
		return spec;
	}
}