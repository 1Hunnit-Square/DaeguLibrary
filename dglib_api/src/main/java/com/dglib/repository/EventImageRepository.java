package com.dglib.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.EventImage;

public interface EventImageRepository extends JpaRepository<EventImage, Long>{
	
	List<EventImage> findByEvent_Eno(Long eno);
	
}
