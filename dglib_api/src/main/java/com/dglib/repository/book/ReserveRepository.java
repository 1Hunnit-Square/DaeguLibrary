package com.dglib.repository.book;



import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;

public interface ReserveRepository extends JpaRepository<Reserve, Long>{
	int countByLibraryBookLibraryBookIdAndState(Long libraryBookId, ReserveState state);
	boolean existsByLibraryBookLibraryBookIdAndMemberMidAndState(Long libraryBookId, String id, ReserveState state);
	
//	@EntityGraph(attributePaths = {"libraryBook", "libraryBook.book", "member"})
//	Page<Reserve> findAll(Pageable pageable);
	
	
	@EntityGraph(attributePaths = {"libraryBook", "member"})
    @Query("SELECT r FROM Reserve r WHERE r.id IN :ids")
    List<Reserve> findAllByIdInWithDetails(List<Long> ids);
	
	@Query("select count(r.state) from LibraryBook l join l.reserves r where r.state = :state and l.libraryBookId = :libraryBookId")
    int countByReserveState(Long libraryBookId, ReserveState state);
	
	@Query("SELECT new com.dglib.dto.book.ReservationCountDTO(r.libraryBook.id, COUNT(r)) " +
		       "FROM Reserve r WHERE r.libraryBook.id IN :libraryBookIds AND r.state = :state " +
		       "GROUP BY r.libraryBook.id")
	List<ReservationCountDTO> findReservationCounts(Collection<Long> libraryBookIds, ReserveState state);
	
	@EntityGraph(attributePaths = {"member", "libraryBook"})
	List<Reserve> findByMemberMidInAndStateAndLibraryBookLibraryBookIdIn(Set<String> memberIds, ReserveState state, Set<Long> libraryBookLibraryIds);
	
	@EntityGraph(attributePaths = "member")
	List<Reserve> findByMemberMidInAndState(Collection<String> memberIds, ReserveState state);
	
	@EntityGraph(attributePaths = {"libraryBook", "member", "libraryBook.book"})
	Page<Reserve> findAll(Specification<Reserve> spec, Pageable pageable);
	
}
