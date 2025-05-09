package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long>{
	// 기본 CRUD 제공

}
