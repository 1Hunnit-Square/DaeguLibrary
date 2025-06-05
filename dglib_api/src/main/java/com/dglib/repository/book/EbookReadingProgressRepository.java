package com.dglib.repository.book;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.dglib.entity.book.EbookReadingProgress;

public interface EbookReadingProgressRepository extends JpaRepository<EbookReadingProgress, Long> {
	
	@EntityGraph(attributePaths = {"ebook", "member"})
	Optional<EbookReadingProgress> findByMemberMidAndEbookEbookId(String mid, Long ebookId);

	

}
