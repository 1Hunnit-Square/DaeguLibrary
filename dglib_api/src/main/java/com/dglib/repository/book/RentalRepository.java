package com.dglib.repository.book;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;

public interface RentalRepository extends JpaRepository<Rental, Long> {
	Optional<Rental> findByLibraryBookLibraryBookIdAndStateNot(Long libraryBookId, RentalState state);
	
	@EntityGraph(attributePaths = {"libraryBook.book", "member"})
	Page<Rental> findAll(Pageable pageable);
	
	@Query("SELECT r.libraryBook.libraryBookId FROM Rental r WHERE r.libraryBook.libraryBookId IN :libraryBookIds AND r.state = com.dglib.entity.book.RentalState.BORROWED")
    List<Long> findBorrowedLibraryBookIdsIn(List<Long> libraryBookIds);
	
	boolean existsByLibraryBookLibraryBookIdAndState(Long libraryBookId, RentalState state);
	
	boolean existsByLibraryBookLibraryBookIdAndStateNot(Long libraryBookId, RentalState state);
	
	@EntityGraph(attributePaths = {"libraryBook", "member"})
    @Query("SELECT r FROM Rental r WHERE r.id IN :ids")
    List<Rental> findAllByIdInWithDetails(List<Long> ids);
	
	@EntityGraph(attributePaths = "member")
	List<Rental> findByMemberMidInAndState(Collection<String> memberIds, RentalState state);
	


}
