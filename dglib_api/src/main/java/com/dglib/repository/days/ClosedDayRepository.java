package com.dglib.repository.days;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.days.ClosedDay;

public interface ClosedDayRepository extends JpaRepository<ClosedDay, LocalDate>{
	
	boolean existsByClosedDate(LocalDate closedDate);

    List<ClosedDay> findByClosedDateBetween(LocalDate start, LocalDate end);

    // 등록 전 중복된 휴관일 날짜 한 번에 조회
    @Query("SELECT c.closedDate FROM ClosedDay c WHERE c.closedDate IN :dates")
    List<LocalDate> findExistingDates(@Param("dates") List<LocalDate> dates);

}
