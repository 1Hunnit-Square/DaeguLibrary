package com.dglib.repository.book;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.book.Ebook;

public interface EbookRepository extends JpaRepository<Ebook, Long> {

	boolean existsByEbookIsbn(String ebookIsbn);

	Optional<Ebook> findTopByOrderByEbookIdDesc();

	
}
