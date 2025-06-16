package com.dglib.repository.book;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.book.Ebook;

public interface EbookRepository extends JpaRepository<Ebook, Long> {

	boolean existsByEbookIsbn(String ebookIsbn);

	Optional<Ebook> findTopByOrderByEbookIdDesc();

	Page<Ebook> findAll(Specification<Ebook> spec, Pageable pageable);


	
}
