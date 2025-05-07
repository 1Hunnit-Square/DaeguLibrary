package com.dglib.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.NoticeImage;

public interface NoticeImageRepository extends JpaRepository<NoticeImage, Integer>{
	
	List<NoticeImage> findByNoticeId(int noticeId);

}
