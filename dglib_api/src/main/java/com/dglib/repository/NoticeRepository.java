package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer>{

}
