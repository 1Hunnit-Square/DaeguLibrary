package com.dglib.repository.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.dglib.entity.book.KeywordFingerprint;

public interface KeywordFingerprintRepository extends JpaRepository<KeywordFingerprint, Long> {

	boolean existsByFingerprintAndKeywordAndSearchDateAfter(
	        String fingerprint, 
	        String keyword, 
	        LocalDateTime searchDate
	    );

	
	



}
