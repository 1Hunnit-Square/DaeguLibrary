package com.dglib.repository.program;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.program.ProgramInfo;

public interface ProgramInfoRepository extends JpaRepository<ProgramInfo, Long> {

	// 사용자 검색
	@Query("""
			  SELECT p FROM ProgramInfo p
			  WHERE
			    (:progName IS NULL OR :progName = '' OR LOWER(p.progName) LIKE LOWER(CONCAT('%', :progName, '%')))
			    AND (:content IS NULL OR :content = '' OR LOWER(p.content) LIKE LOWER(CONCAT('%', :content, '%')))
			    AND (:status IS NULL OR :status = '' OR p.status = :status)
			""")

	Page<ProgramInfo> searchProgram(@Param("progName") String progName, @Param("content") String content,
			@Param("status") String status, Pageable pageable);

	// 관리자 조건 검색
	@Query("""
			    SELECT p FROM ProgramInfo p
			    WHERE
			        (:searchType IS NULL OR :keyword = '' OR (
			            (:searchType = 'progName' AND p.progName LIKE %:keyword%) OR
			            (:searchType = 'teachName' AND p.teachName LIKE %:keyword%)
			        ))
			        AND (:status IS NULL OR p.status = :status)
			        AND (:startDate IS NULL OR p.applyStartAt >= :startDate)
			        AND (:endDate IS NULL OR p.applyEndAt <= :endDate)
			""")
	Page<ProgramInfo> searchAdminPrograms(@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("status") String status, @Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDate") java.time.LocalDateTime endDate, Pageable pageable);
}
