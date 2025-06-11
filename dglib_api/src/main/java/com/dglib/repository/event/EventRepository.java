package com.dglib.repository.event;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.event.Event;

public interface EventRepository extends JpaRepository<Event, Long>{
	Page<Event> findAll(Specification<Event> spec, Pageable pageable);
	List<Event> findAllByIsPinned(boolean isPinned, Sort sort);
}

