package com.dglib.repository.book;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.book.RentalStatusDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.member.Member;

public interface RentalRepository extends JpaRepository<Rental, Long> {
	Optional<Rental> findByLibraryBookLibraryBookIdAndStateNot(Long libraryBookId, RentalState state);
	
	
	@Query("SELECT r.libraryBook.libraryBookId FROM Rental r WHERE r.libraryBook.libraryBookId IN :libraryBookIds AND r.state = com.dglib.entity.book.RentalState.BORROWED")
    List<Long> findBorrowedLibraryBookIdsIn(List<Long> libraryBookIds);
	
	boolean existsByLibraryBookLibraryBookIdAndState(Long libraryBookId, RentalState state);
	
	boolean existsByLibraryBookLibraryBookIdAndStateNot(Long libraryBookId, RentalState state);
	
	@EntityGraph(attributePaths = {"libraryBook", "member"})
    @Query("SELECT r FROM Rental r WHERE r.id IN :ids")
    List<Rental> findAllByIdInWithDetails(List<Long> ids);
	
	@EntityGraph(attributePaths = "member")
	List<Rental> findByMemberMidInAndState(Collection<String> memberIds, RentalState state);
	
	@EntityGraph(attributePaths = "member")
	List<Rental> findByMemberMid(String mid);
	
	
	@EntityGraph(attributePaths = "member")
	@Query("SELECT r FROM Rental r WHERE r.state = com.dglib.entity.book.RentalState.BORROWED AND r.dueDate < :today")
    List<Rental> findOverdueRentals(
        @Param("today") LocalDate today
    );
	
	@EntityGraph(attributePaths = {"libraryBook", "member", "libraryBook.book"})
	Page<Rental> findAll(Specification<Rental> spec, Pageable pageable);
	
	
	@EntityGraph(attributePaths = {"libraryBook", "member", "libraryBook.book", "libraryBook.reserves"})
	List<Rental> findByMemberMidAndState(String mid, RentalState state, Sort sort);
	
	@EntityGraph(attributePaths = {"libraryBook", "member", "libraryBook.reserves"})
	List<Rental> findWithDetailsByRentIdIn(List<Long> ids);
	
	@EntityGraph(attributePaths = {"member"})
	List<Rental> findByMemberMidAndRentStartDateBetweenOrderByRentStartDateAsc(String mid, LocalDate startDate, LocalDate endDate);
	
	
	@Query("SELECT r FROM Rental r WHERE r.member.mid IN :memberIds AND r.dueDate < :currentDate AND r.state = com.dglib.entity.book.RentalState.BORROWED")
	@EntityGraph(attributePaths = {"member"})
	List<Rental> findOverdueRentalsByMemberIds(@Param("memberIds") Set<String> memberIds, @Param("currentDate") LocalDate currentDate);
	
	
	@Query("SELECT r FROM Rental r WHERE r.member.mid = :mid AND r.state = :state")
	List<Rental> findActiveBorrowedRentals(String mid, RentalState state);
	
	
	@Query("SELECT new com.dglib.dto.book.RentalStatusDTO(r.libraryBook.libraryBookId, true) " +
		       "FROM Rental r WHERE r.libraryBook.libraryBookId IN :libraryBookIds AND r.state = 'BORROWED'")
	List<RentalStatusDTO> findRentalStatusByLibraryBookIds(@Param("libraryBookIds") List<Long> libraryBookIds);
	
	
	
	@Query("SELECT r FROM Rental r WHERE r.libraryBook.libraryBookId = :libraryBookId AND r.state = :state")
	List<Rental> findRentalsByLibraryBookIdAndState(@Param("libraryBookId") Long libraryBookId, 
	                                               @Param("state") RentalState state);
	
	@Query("SELECT r FROM Rental r WHERE r.libraryBook.libraryBookId IN :libraryBookIds")
	List<Rental> findByLibraryBookIdIn(@Param("libraryBookIds") List<Long> libraryBookIds);


	boolean existsByMemberAndState(Member member, RentalState borrowed);


	

	
	
	
	


}