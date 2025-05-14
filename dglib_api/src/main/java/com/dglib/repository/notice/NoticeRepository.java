package com.dglib.repository.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.notice.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

	// 숨김되지 않은 모든 공지사항 조회 + 고정 공지는 상단 정렬
	@Query("SELECT n FROM Notice n WHERE n.isHidden = false ORDER BY n.isPinned DESC, n.postedAt DESC")
	Page<Notice> findVisibleNotices(Pageable pageable);

	// 키워드가 포함된 공지사항 조회 + 고정 공지는 상단 정렬
	@Query("SELECT n FROM Notice n WHERE n.isHidden = false AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword%) ORDER BY n.isPinned DESC, n.postedAt DESC")
	Page<Notice> searchVisible(@Param("keyword") String keyword, Pageable pageable);

}
