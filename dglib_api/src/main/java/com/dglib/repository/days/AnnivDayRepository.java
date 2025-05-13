package com.dglib.repository.days;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.days.AnnivDay;

public interface AnnivDayRepository extends JpaRepository<AnnivDay, Long>{
	
	List<AnnivDay> findByAnnivDateBetween(LocalDate start, LocalDate end);
	
}
