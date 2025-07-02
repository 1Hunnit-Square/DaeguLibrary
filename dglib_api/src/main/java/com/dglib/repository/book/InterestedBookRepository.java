package com.dglib.repository.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.dglib.entity.book.InterestedBook;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.member.Member;

public interface InterestedBookRepository extends JpaRepository<InterestedBook, Long> {
	
	@EntityGraph(attributePaths = "member")
	List<InterestedBook> findAllByMemberMid(String mid);
	
	@EntityGraph(attributePaths = {"member", "libraryBook", "libraryBook.book"})
	Page<InterestedBook> findAll(Specification<InterestedBook> spec, Pageable pageable);
	
	List<InterestedBook> findByIbIdIn(List<Long> ibIds);
	
	@EntityGraph(attributePaths = {"member", "libraryBook", "libraryBook.book"})
	List<InterestedBook> findByLibraryBookInAndMemberMid(List<LibraryBook> libraryBooks, String mid);
	
	

}
