package com.dglib.repository.news;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.news.NewsImage;

public interface NewsImageRepository extends JpaRepository<NewsImage, Long> {

	// 특정 공지사항의 모든 첨부파일 조회
	List<NewsImage> findByNews_Nno(Long nno);

	// 특정 공지사항에 연결된 파일이 있는지 확인
	boolean existsByNews_Nno(Long nno);

	// 파일 번호로 단일 조회 (필요 시)
	Optional<NewsImage> findByIno(Long ino);
}
