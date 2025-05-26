package com.dglib.repository.book;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.book.Keyword;

public interface KeywordRepository extends JpaRepository<Keyword, String> {
	
	List<Keyword> findTop5ByOrderBySearchCountDesc();

	void deleteByLastSearchDateBefore(LocalDate minusWeeks);
	

}
