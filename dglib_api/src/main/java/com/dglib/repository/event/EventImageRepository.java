package com.dglib.repository.event;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.event.EventImage;

public interface EventImageRepository extends JpaRepository<EventImage, Long> {

	// 특정 새소식의 모든 첨부파일 조회
	List<EventImage> findByEvent_Eno(Long eno);

	// 특정 새소식에 연결된 파일이 있는지 확인
	boolean existsByEvent_Eno(Long eno);

	// 파일 번호로 단일 조회 (필요 시)
	Optional<EventImage> findByIno(Long ino);
}
