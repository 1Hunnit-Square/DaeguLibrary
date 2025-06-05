package com.dglib.repository.gallery;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.gallery.GalleryImage;
import com.dglib.entity.notice.NoticeFile;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
	// 특정 갤러리의 모든 첨부파일 조회
	List<NoticeFile> findByGallery_Gno(Long gno);

	// 특정 갤러리에 연결된 파일이 있는지 확인
	boolean existsByGallery_Gno(Long gno);

	// 파일 번호로 단일 조회 (필요 시)
	Optional<GalleryImage> findByIno(Long ino);
}
