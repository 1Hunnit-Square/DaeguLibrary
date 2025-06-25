package com.dglib.repository.news;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.news.News;
import com.dglib.entity.notice.Notice;

import jakarta.transaction.Transactional;

public interface NewsRepository extends JpaRepository<News, Long> {

	Page<News> findAll(Specification<News> spec, Pageable pageable);
	Page<News> findAllByIsHidden(boolean isHidden, Pageable pageable);
	List<News> findAllByIsPinnedAndIsHidden(boolean isPinned, boolean isHidden, Sort sort);

	@Transactional
	void deleteByNnoIn(List<Long> ids);
}
