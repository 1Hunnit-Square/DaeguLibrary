package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Events;

public interface EventsRepository extends JpaRepository<Events, Long>{
	// 기본 CRUD 제공

}
