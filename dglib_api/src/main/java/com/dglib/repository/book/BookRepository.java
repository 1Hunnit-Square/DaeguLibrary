package com.dglib.repository.book;


import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.book.Book;

public interface BookRepository extends JpaRepository<Book, String> {
	
	@EntityGraph(attributePaths = {"libraryBooks"})
	Book findByIsbn(String isbn);
	
	@Query(value = """
			SELECT b.*
			FROM library_book lb
			JOIN book b ON lb.isbn = b.isbn
			JOIN rental r ON lb.library_book_id = r.library_book_id
			WHERE lb.is_deleted = false
			AND r.rent_start_date BETWEEN :startDate AND :endDate
			GROUP BY b.isbn, b.book_title, b.author, b.publisher, b.pub_date, b.description, b.cover
			ORDER BY COUNT(r.rent_id) DESC
			LIMIT 5
			""", nativeQuery = true)
	List<Book> findTop5BorrowedBooks(
		@Param("startDate") LocalDate startDate,
		@Param("endDate") LocalDate endDate);
	
	@Query(value = """
			SELECT b.*
			FROM library_book lb
			JOIN book b ON lb.isbn = b.isbn
			WHERE lb.is_deleted = false
			AND lb.reg_library_book_date BETWEEN :startDate AND :endDate
			GROUP BY b.isbn, b.book_title, b.author, b.publisher, b.pub_date, b.description, b.cover
			ORDER BY MAX(lb.reg_library_book_date) DESC
			LIMIT 5
			""", nativeQuery = true)
	List<Book> findTop5NewBooks(
		@Param("startDate") LocalDate startDate,
		@Param("endDate") LocalDate endDate);
	
	
	@Query(value = """
			SELECT
			    b.book_title,
			    b.author,
			    b.publisher,
			    b.isbn,
			    b.pub_date,
			    (SELECT COUNT(*) 
			     FROM library_book lb2 
			     WHERE lb2.isbn = b.isbn AND lb2.is_deleted = false) AS book_count,
			    COUNT(r.rent_id) AS borrow_count
			FROM book b
			JOIN library_book lb ON b.isbn = lb.isbn
			JOIN rental r ON lb.library_book_id = r.library_book_id
			WHERE lb.is_deleted = false
			AND r.rent_start_date BETWEEN :startDate AND :endDate
			GROUP BY b.isbn, b.book_title, b.author, b.publisher, b.pub_date
			ORDER BY borrow_count DESC
			LIMIT 10
			""", nativeQuery = true)
		List<Object[]> findTop10BorrowedBookRaw(
			@Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate
		);
	
	
	

	
	

}
