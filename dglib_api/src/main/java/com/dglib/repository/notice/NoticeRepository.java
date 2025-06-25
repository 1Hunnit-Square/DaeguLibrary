package com.dglib.repository.notice;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.dglib.entity.notice.Notice;

import jakarta.transaction.Transactional;

public interface NoticeRepository extends JpaRepository<Notice, Long>, JpaSpecificationExecutor<Notice> {

	Page<Notice> findAll(Specification<Notice> spec, Pageable pageable);
	Page<Notice> findAllByIsHidden(boolean isHidden, Pageable pageable);
	List<Notice> findAllByIsPinnedAndIsHidden(boolean isPinned, boolean isHidden, Sort sort);

	@Transactional
	void deleteByAnoIn(List<Long> ids);
}
