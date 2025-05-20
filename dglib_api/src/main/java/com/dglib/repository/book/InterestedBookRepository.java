package com.dglib.repository.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.book.InterestedBook;

public interface InterestedBookRepository extends JpaRepository<InterestedBook, Long> {
	
	@EntityGraph(attributePaths = "member")
	List<InterestedBook> findAllByMemberMid(String mid);
	
	@EntityGraph(attributePaths = {"member", "libraryBook", "libraryBook.book", "libraryBook.reserves", "libraryBook.rentals"})
	Page<InterestedBook> findAll(Specification<InterestedBook> spec, Pageable pageable);
	

}
