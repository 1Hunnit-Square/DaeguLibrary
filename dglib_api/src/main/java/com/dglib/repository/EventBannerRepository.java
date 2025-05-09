package com.dglib.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.EventBanner;

public interface EventBannerRepository extends JpaRepository<EventBanner, Long>{
	
	Optional<EventBanner> findByEvents_Eno(Long eno);

}
