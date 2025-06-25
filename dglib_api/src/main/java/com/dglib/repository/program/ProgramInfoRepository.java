package com.dglib.repository.program;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
				        (:keyword IS NULL OR :keyword = '')
				        OR
				        (
				            :searchType = 'progName' AND p.progName LIKE %:keyword%
				        )
				        OR
				        (
				            :searchType = 'content' AND p.content LIKE %:keyword%
				        )
				        OR
				        (
				            :searchType = 'all' AND (p.progName LIKE %:keyword% OR p.content LIKE %:keyword%)
				        )
				    )
				    AND (:status IS NULL OR :status = '' OR p.status = :status)
				    AND (:endDate IS NULL OR p.applyEndAt <= :endDate)
			""")
	Page<ProgramInfo> searchPrograms(@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("status") String status, @Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, Pageable pageable);

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
			        AND (:endDate IS NULL OR p.applyEndAt <= :endDate)
			""")
	Page<ProgramInfo> searchAdminPrograms(@Param("searchType") String searchType, @Param("keyword") String keyword,
			@Param("status") String status, @Param("startDate") java.time.LocalDateTime startDate,
			@Param("endDate") java.time.LocalDateTime endDate, Pageable pageable);

	// 관리자 복합 검색
	@Query("""
				SELECT p FROM ProgramInfo p
				WHERE
					(:progName IS NULL OR p.progName LIKE %:progName%)
					AND (:content IS NULL OR p.content LIKE %:content%)
			""")
	Page<ProgramInfo> searchProgram(@Param("progName") String progName, @Param("content") String content,
			Pageable pageable);

	// 해당 기간 동안 장소 중복 체크
	@Query("""
			    SELECT COUNT(p) > 0 FROM ProgramInfo p
			    JOIN p.daysOfWeek d
			    WHERE p.room = :room
			      AND d IN :daysOfWeek
			      AND p.startDate <= :endDate
			      AND p.endDate >= :startDate
			      AND NOT (
			          p.endTime <= :startTime OR p.startTime >= :endTime
			      )
			""")
	boolean existsByRoomAndOverlap(@Param("room") String room, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate, @Param("daysOfWeek") List<Integer> daysOfWeek,
			@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);

	// 특정 강의실, 시작일, 종료일, 요일, 시작 시간, 종료 시간 기준으로 중복되는 프로그램이 있는지 확인
	@Query("SELECT COUNT(p) > 0 FROM ProgramInfo p WHERE " + "p.room = :room AND " + // 강의실 일치
			"(:startDate <= p.endDate AND :endDate >= p.startDate) AND " + // 날짜 범위 중복
			"EXISTS (SELECT d FROM p.daysOfWeek d WHERE d IN :daysOfWeek) AND " + // 요일 중복 (컬렉션 필드 가정)
			"((:startTime < p.endTime AND :endTime > p.startTime) OR " + // 시간 범위 중복
			"(:startTime = p.startTime AND :endTime = p.endTime))")
	boolean existsConflictingProgram(@Param("room") String room, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate, @Param("daysOfWeek") List<Integer> daysOfWeek,
			@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);

	// 기간 전체에 대해 겹치는지 여부만 판단 (범위 기준)
	@Query("""
			    SELECT COUNT(p) > 0 FROM ProgramInfo p
			    JOIN p.daysOfWeek d
			    WHERE p.room = :room
			      AND p.startDate <= :date
			      AND p.endDate >= :date
			      AND d = :dayOfWeek
			      AND (
			        p.startTime < :endTime AND p.endTime > :startTime
			      )
			""")
	boolean existsByRoomAndDateTimeOverlap(@Param("room") String room, @Param("date") LocalDate date,
			@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime,
			@Param("dayOfWeek") int dayOfWeek);
	
	
	List<ProgramInfo> findByEndDateGreaterThanEqual(LocalDate endDate, Sort sort); 

}