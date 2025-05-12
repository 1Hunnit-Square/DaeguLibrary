package com.dglib.repository.event;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.event.EventImage;

public interface EventImageRepository extends JpaRepository<EventImage, Long>{
	
	List<EventImage> findByEvent_Eno(Long eno);
	
}
