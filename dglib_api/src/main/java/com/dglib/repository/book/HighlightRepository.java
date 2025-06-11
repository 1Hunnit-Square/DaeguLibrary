package com.dglib.repository.book;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.dglib.entity.book.Highlight;

public interface HighlightRepository extends JpaRepository<Highlight, Long> {
	
	@EntityGraph(attributePaths = {"member", "ebook"})
    List<Highlight> findByMemberMidAndEbookEbookIdOrderByCreatedAtAsc(String mid, Long ebookId);
    
	
	@EntityGraph(attributePaths = {"member", "ebook"})
    Optional<Highlight> findByMemberMidAndEbookEbookIdAndKey(String mid, Long ebookId, String key);
    
	@EntityGraph(attributePaths = {"member", "ebook"})
    void deleteByMemberMidAndEbookEbookIdAndKey(String mid, Long ebookId, String key);
    
    @Query("SELECT h FROM Highlight h WHERE h.member.mid = :mid AND h.ebook.ebookId = :ebookId AND h.cfiRange = :cfiRange")
    @EntityGraph(attributePaths = {"member", "ebook"})
    Optional<Highlight> findByMemberMidAndEbookEbookIdAndCfiRange(String mid, Long ebookId, String cfiRange);
    
    @EntityGraph(attributePaths = {"member", "ebook"})
    List<Highlight> findByMemberMidAndEbookEbookIdIn(String mid, List<Long> ebookId);
  	

}
