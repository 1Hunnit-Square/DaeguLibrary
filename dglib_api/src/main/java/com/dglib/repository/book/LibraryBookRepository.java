package com.dglib.repository.book;

import java.time.LocalDate;
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
import com.dglib.dto.book.BookStatusDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.LibraryBookStatusDTO;
import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.entity.book.Book;
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
	
	@EntityGraph(attributePaths = {"book"})
	Optional<LibraryBook> findByLibraryBookIdAndIsDeletedFalse(Long libraryBookId);
	
	
	@Query("SELECT COUNT(r) > 0 FROM Rental r WHERE r.libraryBook.libraryBookId = :libraryBookId AND r.state = :state")
	boolean existsRentalByLibraryBookIdAndState(@Param("libraryBookId") Long libraryBookId, 
	                                           @Param("state") RentalState state);
	
	
	@Query("SELECT COUNT(r) > 0 FROM Rental r WHERE r.libraryBook.libraryBookId = :libraryBookId AND r.member.mid = :mid AND r.state = :state")
	boolean existsRentalByLibraryBookIdAndMemberAndState(@Param("libraryBookId") Long libraryBookId,
	                                                    @Param("mid") String mid,
	                                                    @Param("state") RentalState state);

	@Query("SELECT COUNT(r) > 0 FROM Reserve r WHERE r.libraryBook.libraryBookId = :libraryBookId AND r.member.mid = :mid AND r.state = :state AND r.isUnmanned = :unmanned")
	boolean existsReserveByLibraryBookIdAndMemberAndStateAndUnmanned(@Param("libraryBookId") Long libraryBookId,
	                                                                @Param("mid") String mid,
	                                                                @Param("state") ReserveState state,
	                                                                @Param("unmanned") boolean unmanned);
	
	@Query("SELECT COUNT(r) > 0 FROM Reserve r WHERE r.libraryBook.libraryBookId = :libraryBookId AND r.state = :state AND r.isUnmanned = :unmanned")
	boolean existsReserveByLibraryBookIdAndStateAndUnmanned(@Param("libraryBookId") Long libraryBookId,
	                                                       @Param("state") ReserveState state,
	                                                       @Param("unmanned") boolean unmanned);
	
	@EntityGraph(attributePaths = {"book"})
	Optional<LibraryBook> findFirstByBookIsbnAndIsDeletedFalse(String isbn);
	
	
	@Query(value = """
		    SELECT lb.library_book_id, lb.call_sign, lb.location,
	           (SELECT COUNT(*) FROM reserve r WHERE r.library_book_id = lb.library_book_id AND r.state = 'RESERVED') as reserve_count,
	           (SELECT COUNT(*) FROM rental rt WHERE rt.library_book_id = lb.library_book_id AND rt.state = 'BORROWED') as borrow_count,
	           (SELECT COUNT(*) FROM reserve r WHERE r.library_book_id = lb.library_book_id AND r.state = 'RESERVED' AND r.is_unmanned = true) as unmanned_count,
	           (SELECT rt.due_date FROM rental rt WHERE rt.library_book_id = lb.library_book_id AND rt.state = 'BORROWED' LIMIT 1) as due_date
	    FROM library_book lb 
	    JOIN book b ON lb.isbn = b.isbn
	    WHERE b.isbn = :isbn AND lb.is_deleted = false
	    """, nativeQuery = true)
	List<Object[]> findLibraryBookStatusByIsbn(@Param("isbn") String isbn);
	
	
	
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
	

	
//	@EntityGraph(attributePaths = {"book", "rentals", "reserves"})
	Page<LibraryBook> findAll(Specification<LibraryBook> spec, Pageable pageable);
	
	
	@Query("SELECT new com.dglib.dto.book.BookStatusDTO (" +
		       "lb.libraryBookId, " +
		       "CASE WHEN EXISTS(SELECT 1 FROM Rental r WHERE r.libraryBook = lb AND r.state = 'BORROWED') THEN true ELSE false END, " +
		       "CASE WHEN EXISTS(SELECT 1 FROM Reserve rv WHERE rv.libraryBook = lb AND rv.state = 'RESERVED' AND rv.isUnmanned = true) THEN true ELSE false END, " +
		       "CASE WHEN EXISTS(SELECT 1 FROM Rental r WHERE r.libraryBook = lb AND r.state = 'BORROWED' AND r.dueDate < CURRENT_DATE) THEN true ELSE false END, " +
		       "(SELECT COUNT(rv) FROM Reserve rv WHERE rv.libraryBook = lb AND rv.state = 'RESERVED')" +
		       ") FROM LibraryBook lb")
		List<BookStatusDTO> findBookStatuses(List<Long> libraryBookIds);
	
	
	
	@EntityGraph(attributePaths = {"book", "rentals"})
	List<LibraryBook> findAllByBookIsbnAndIsDeletedFalse(String isbn);
	
	
	boolean existsByBookIsbnAndIsDeletedFalse(String isbn);
	
	
	@Query("SELECT lb.libraryBookId FROM LibraryBook lb WHERE lb.libraryBookId IN :libraryBookIds")
    List<Long> findExistingLibraryBookIds(@Param("libraryBookIds") List<Long> libraryBookIds);
	
	@Query("SELECT lb.callSign FROM LibraryBook lb WHERE lb.callSign IN :callSigns AND lb.libraryBookId NOT IN :excludeIds")
    List<String> findExistingCallSignsExcludeIds(@Param("callSigns") List<String> callSigns, @Param("excludeIds") List<Long> excludeIds);
	
	List<LibraryBook> findByLibraryBookIdIn(List<Long> libraryBookIds);
	
	@EntityGraph(attributePaths = {"book"})
	Page<LibraryBook> findByRegLibraryBookDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
	
	

	
	@Query("""
		    SELECT lb FROM LibraryBook lb
		    WHERE lb.regLibraryBookDate BETWEEN :startDate AND :endDate
		    AND lb.regLibraryBookDate = (
		        SELECT MIN(lb2.regLibraryBookDate) 
		        FROM LibraryBook lb2 
		        WHERE lb2.book.id = lb.book.id
		    )
		    AND lb.isDeleted = false
		    """)
	@EntityGraph(attributePaths = {"book"})
	Page<LibraryBook> findFirstRegisteredBooksByDateBetween(
	    @Param("startDate") LocalDate startDate, 
	    @Param("endDate") LocalDate endDate, 
	    Pageable pageable
	);
	
	
	@Query(value = """
		    SELECT b.book_title, b.author, b.publisher, b.pub_date, b.cover,
		           COUNT(r.rent_id) as borrow_count, b.isbn
		    FROM library_book lb
		    JOIN book b ON lb.isbn = b.isbn
		    JOIN rental r ON lb.library_book_id = r.library_book_id
		    WHERE r.rent_start_date BETWEEN :startDate AND :endDate
		    AND lb.is_deleted = false
		    GROUP BY b.isbn
		    ORDER BY borrow_count DESC
		    LIMIT 100
		    """,
		    nativeQuery = true)
	List<Object[]> findTop100BorrowedBooks(
	 @Param("startDate") LocalDate startDate,
	 @Param("endDate") LocalDate endDate);
	
	
	
	
	@EntityGraph(attributePaths = {"book"})
	@Query("SELECT lb FROM LibraryBook lb WHERE REPLACE(LOWER(lb.book.bookTitle), ' ', '') LIKE CONCAT('%', REPLACE(LOWER(:bookTitle), ' ', ''), '%') AND lb.isDeleted = false")
	List<LibraryBook> findByBookTitleIgnoringSpacesAndCase(@Param("bookTitle") String book_title);
	
	@Query("SELECT lb FROM LibraryBook lb LEFT JOIN FETCH lb.rentals WHERE lb.book.isbn = :isbn AND lb.isDeleted = false")
	List<LibraryBook> findAllByBookIsbnWithRentals(@Param("isbn") String isbn);
	
	@Query("SELECT COUNT(lb) FROM LibraryBook lb WHERE REPLACE(LOWER(lb.book.author), ' ', '') LIKE CONCAT('%', REPLACE(LOWER(:author), ' ', ''), '%') AND lb.isDeleted = false")
	Long countByAuthorIgnoringSpacesAndCase(@Param("author") String author);
	
	@Query(value = """
			SELECT b.isbn
			FROM library_book lb
			JOIN book b ON lb.isbn = b.isbn
			LEFT JOIN rental r ON lb.library_book_id = r.library_book_id
			WHERE lb.is_deleted = false
			AND REPLACE(LOWER(b.author), ' ', '') LIKE CONCAT('%', REPLACE(LOWER(:author), ' ', ''), '%')
			GROUP BY b.isbn
			ORDER BY COUNT(r.rent_id) DESC
			LIMIT 5
			""", nativeQuery = true)
			List<String> findTop5BorrowedBooksByAuthor(
			    @Param("author") String author);
	
	@Query(value = """
			SELECT b.isbn
			FROM library_book lb
			JOIN book b ON lb.isbn = b.isbn
			LEFT JOIN rental r ON lb.library_book_id = r.library_book_id
			WHERE lb.is_deleted = false
			AND (r.rent_start_date IS NULL OR r.rent_start_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH))
			GROUP BY b.isbn
			ORDER BY COUNT(r.rent_id) DESC
			LIMIT 5
			""", nativeQuery = true)
	List<String> findTop5BorrowedBooks();
	
	
	
	@Query(value = """
			SELECT b.isbn
			FROM library_book lb
			JOIN book b ON lb.isbn = b.isbn
			WHERE lb.is_deleted = false
			ORDER BY lb.reg_library_book_date DESC
			LIMIT 10
			""", nativeQuery = true)
			List<String> findTop10NewBooks();
	
	
	
	
	

}
