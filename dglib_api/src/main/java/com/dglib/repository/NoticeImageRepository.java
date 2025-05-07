package com.dglib.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.NoticeImage;

public interface NoticeImageRepository extends JpaRepository<NoticeImage, Long>{
	
	List<NoticeImage> findByNotice_Ano(Long ano);

}
