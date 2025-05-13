package com.dglib.repository.days;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.days.ClosedDay;

public interface ClosedDayRepository extends JpaRepository<ClosedDay, Long>{

}
