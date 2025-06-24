package com.dglib.repository.gallery;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.gallery.Gallery;

import jakarta.transaction.Transactional;

public interface GalleryRepository extends JpaRepository<Gallery, Long> {
	Page<Gallery> findAll(Specification<Gallery> spec, Pageable pageable);
	
	@Transactional
	void deleteByGnoIn(List<Long> ids);
}
