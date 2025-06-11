package com.dglib.repository.book;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.dglib.entity.book.EbookReadingProgress;
import com.dglib.entity.book.Highlight;

public interface EbookReadingProgressRepository extends JpaRepository<EbookReadingProgress, Long> {
	
	@EntityGraph(attributePaths = {"ebook", "member"})
	Optional<EbookReadingProgress> findByMemberMidAndEbookEbookId(String mid, Long ebookId);
	
	@EntityGraph(attributePaths = {"member", "ebook"})
    List<EbookReadingProgress> findByMemberMidAndEbookEbookIdIn(String mid, List<Long> ebookId);

	

}
