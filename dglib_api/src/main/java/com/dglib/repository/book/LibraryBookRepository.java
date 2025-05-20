package com.dglib.repository.book;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.book.BookStatusCountDto;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.ReserveState;

public interface LibraryBookRepository extends JpaRepository<LibraryBook, Long> {
	
	@EntityGraph(attributePaths = "book")
	Optional<LibraryBook> findByLibraryBookId(Long id);
	

	
	
	@EntityGraph(attributePaths = "book")
	@Query("SELECT new com.dglib.dto.book.LibraryBookSearchByBookIdDTO(" + "b.bookTitle, " + "b.author, " + "b.publisher, "
			+ "b.pubDate, " + "lb.location, " + "lb.callSign, " + "b.isbn, " + "lb.libraryBookId, "
			+ "CASE WHEN EXISTS (SELECT 1 FROM Rental r WHERE r.libraryBook.libraryBookId = lb.libraryBookId AND r.state = com.dglib.entity.book.RentalState.BORROWED) THEN true ELSE false END,"
			+ "CASE WHEN EXISTS (SELECT 1 FROM Reserve r WHERE r.libraryBook.libraryBookId = lb.libraryBookId AND r.state = com.dglib.entity.book.ReserveState.RESERVED AND r.isUnmanned = false) THEN true ELSE false END,"
			+ "CASE WHEN EXISTS (SELECT 1 FROM Reserve r WHERE r.libraryBook.libraryBookId = lb.libraryBookId AND r.state = com.dglib.entity.book.ReserveState.RESERVED AND r.isUnmanned = true) THEN true ELSE false END"
			+ ") " + "FROM LibraryBook lb JOIN lb.book b WHERE lb.libraryBookId = :libraryBookId")
	Page<LibraryBookSearchByBookIdDTO> findBookByLibraryBookId(Long libraryBookId, Pageable pageable);
	
	@EntityGraph(attributePaths = {"book", "rentals", "reserves"})
	Optional<LibraryBook> findWithDetailsByLibraryBookId(Long libraryBookId);
	
	
	
	@EntityGraph(attributePaths = {"book"})
	@Query("""
		    select new com.dglib.dto.book.BookStatusCountDto(
		        (select count(r) from Reserve r where r.state = :reserveState and r.member.mno = :mno and r.isUnmanned = false),
		        (select count(b) from Rental b where b.state = :rentalState and b.member.mno = :mno),
		        (select count(u) from Reserve u where u.state = :reserveState and u.member.mno = :mno and u.isUnmanned = true)
		    
		    )
		""")
		BookStatusCountDto countReserveAndBorrowDto(String mno, @Param("reserveState") ReserveState reserveState, @Param("rentalState") RentalState rentalState);
	
	
	@Query("SELECT lb.callSign FROM LibraryBook lb WHERE lb.callSign IN :callSigns")
	List<String> findExistingCallSigns(@Param("callSigns") List<String> callSigns);
	

	
	@EntityGraph(attributePaths = {"book", "rentals", "reserves"})
	Page<LibraryBook> findAll(Specification<LibraryBook> spec, Pageable pageable);
	
	
	
	@EntityGraph(attributePaths = {"book"})
	List<LibraryBook> findAllByBookIsbn(String isbn);
	
	@EntityGraph(attributePaths = {"book"})
	boolean existsByBookIsbn(String isbn);
	
	
	@Query("SELECT lb.libraryBookId FROM LibraryBook lb WHERE lb.libraryBookId IN :libraryBookIds")
    List<Long> findExistingLibraryBookIds(@Param("libraryBookIds") List<Long> libraryBookIds);
	
	@Query("SELECT lb.callSign FROM LibraryBook lb WHERE lb.callSign IN :callSigns AND lb.libraryBookId NOT IN :excludeIds")
    List<String> findExistingCallSignsExcludeIds(@Param("callSigns") List<String> callSigns, @Param("excludeIds") List<Long> excludeIds);
	
	
	
	

}
