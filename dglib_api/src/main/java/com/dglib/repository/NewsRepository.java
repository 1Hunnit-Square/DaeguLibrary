package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.News;

public interface NewsRepository extends JpaRepository<News, Long>{

}
