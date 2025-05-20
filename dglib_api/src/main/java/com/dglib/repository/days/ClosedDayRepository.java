package com.dglib.repository.days;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.days.ClosedDay;

public interface ClosedDayRepository extends JpaRepository<ClosedDay, LocalDate>{
	
	boolean existsByClosedDate(LocalDate closedDate);

    List<ClosedDay> findByClosedDateBetween(LocalDate start, LocalDate end);
}
