package com.dglib.repository.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.book.WishBook;
import com.dglib.entity.book.WishBookState;

public interface WishBookRepository	extends JpaRepository<WishBook, Long>, JpaSpecificationExecutor<WishBook> {
	
	
	@Query(""" 
			SELECT COUNT(w) 
			FROM WishBook w 
			WHERE w.member.mid = :mid 
			AND w.appliedAt BETWEEN :start AND :end
			AND w.state != :state
			""")
    Long countByMidAndAppliedAtBetween(
        @Param("mid") String mid,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("state") WishBookState state
    );
	
	@Query("""
			SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END 
		    FROM WishBook w WHERE w.isbn = :isbn AND w.state <> :state1 AND w.state <> :state2
		       """)
	boolean existsByIsbnAndStateNotTwo(@Param("isbn") String isbn,
		                                   @Param("state1") WishBookState state1,
		                                   @Param("state2") WishBookState state2);
	
	Optional<WishBook> findByIsbnAndState(String insb, WishBookState state);
	
	@EntityGraph(attributePaths = {"member"})
	Optional<WishBook> findByWishNoAndMemberMid(Long no, String mid);
	
	
	
	@EntityGraph(attributePaths = {"member"})
	List<WishBook> findAll(Specification<WishBook> spec);
	
	@EntityGraph(attributePaths = {"member"})
	Page<WishBook> findAllWithMemberBy(Pageable pageable, Specification<WishBook> spec);
	

}
