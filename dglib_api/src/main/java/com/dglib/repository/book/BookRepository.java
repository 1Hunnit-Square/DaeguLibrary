package com.dglib.repository.book;


import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.book.Book;

public interface BookRepository extends JpaRepository<Book, String> {
	
	@EntityGraph(attributePaths = {"libraryBooks"})
	Book findByIsbn(String isbn);
	
	
	

}
