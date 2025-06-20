package com.dglib.repository.event;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.event.EventBanner;

public interface EventBannerRepository extends JpaRepository<EventBanner, Long>{
	
	Optional<EventBanner> findByEvent_Eno(Long eno);
	boolean existsByEvent_Eno(Long eno);


}
