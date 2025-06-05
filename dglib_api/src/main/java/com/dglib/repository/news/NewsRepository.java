package com.dglib.repository.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.news.News;

public interface NewsRepository extends JpaRepository<News, Long>{

	Page<News> findAll(Specification<News> spec, Pageable pageable);
}
