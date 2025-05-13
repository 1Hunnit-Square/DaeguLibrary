package com.dglib.repository.news;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.news.News;

public interface NewsRepository extends JpaRepository<News, Long>{

}
