package com.dglib.repository.program;

import java.time.LocalDate;
import java.util.List;

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
			    (
			      (:progName IS NULL OR :progName = '')
			      OR LOWER(p.progName) LIKE LOWER(CONCAT('%', :progName, '%'))
			    )
			    OR
			    (
			      (:content IS NULL OR :content = '')
			      OR LOWER(p.content) LIKE LOWER(CONCAT('%', :content, '%'))
			    )
			    AND (:status IS NULL OR :status = '' OR p.status = :status)
			""")
	Page<ProgramInfo> searchProgram(@Param("progName") String progName, @Param("content") String content,
			@Param("status") String status, Pageable pageable);

	// 관리자 조건 검색
	@Query("""
			    SELECT p FROM ProgramInfo p
			    WHERE
			        (
			            (:searchType IS NULL OR :searchType = '' OR :keyword IS NULL OR :keyword = '')
			            OR
			            (:searchType = 'progName' AND p.progName LIKE %:keyword%)
			            OR
			            (:searchType = 'teachName' AND p.teachName LIKE %:keyword%)
			        )
			        AND (:status IS NULL OR :status = '' OR p.status = :status)
			        AND (:startDate IS NULL OR p.applyStartAt >= :startDate)
			        AND (:endDate IS NULL OR p.applyEndAt <= :endDate)
			""")
	Page<ProgramInfo> searchAdminPrograms(@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("status") String status, @Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDate") java.time.LocalDateTime endDate, Pageable pageable);

	// 해당 기간 동안 장소 중복 체크
	@Query("""
			SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM ProgramInfo p
			WHERE p.room = :room
			AND (
			  (p.startDate <= :endDate AND p.endDate >= :startDate)
			)
			AND EXISTS (
			  SELECT d FROM p.daysOfWeek d WHERE d IN :daysOfWeek
			)
			""")
	boolean existsByRoomAndOverlap(@Param("room") String room, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate, @Param("daysOfWeek") List<Integer> daysOfWeek
	);

}