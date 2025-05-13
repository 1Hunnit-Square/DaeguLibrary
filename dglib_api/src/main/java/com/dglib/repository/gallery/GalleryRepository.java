package com.dglib.repository.gallery;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.gallery.Gallery;

public interface GalleryRepository extends JpaRepository<Gallery, Long> {

}
