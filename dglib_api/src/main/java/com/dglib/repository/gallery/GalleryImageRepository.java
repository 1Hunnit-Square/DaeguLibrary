package com.dglib.repository.gallery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.gallery.GalleryImage;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
	
	List<GalleryImage> findByGallery_Gno(Long gno);
	
}
