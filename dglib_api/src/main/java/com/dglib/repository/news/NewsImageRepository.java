package com.dglib.repository.news;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.news.NewsImage;

public interface NewsImageRepository extends JpaRepository<NewsImage, Long>{
	
	List<NewsImage> findByNews_Nno(Long nno);

}
