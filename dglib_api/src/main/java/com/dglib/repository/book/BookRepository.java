package com.dglib.repository.book;


import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.book.Book;

public interface BookRepository extends JpaRepository<Book, String> {
	
	
	

}
