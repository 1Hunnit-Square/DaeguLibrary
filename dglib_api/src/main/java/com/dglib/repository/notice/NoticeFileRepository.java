package com.dglib.repository.notice;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.member.Member;
import com.dglib.entity.notice.NoticeFile;

public interface NoticeFileRepository extends JpaRepository<NoticeFile, Long>{
	
	//특정 공지사항의 모든 첨부파일 조회
	List<NoticeFile> findByNotice_Ano(Long ano);
	
	// 특정 공지사항에 연결된 파일이 있는지 확인
    boolean existsByNotice_Ano(Long ano);

    // 파일 번호로 단일 조회 (필요 시)
    Optional<NoticeFile> findByFno(Long fno);


}
