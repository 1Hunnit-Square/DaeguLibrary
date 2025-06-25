package com.dglib.repository.program;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.program.ProgramBanner;

public interface ProgramBannerRepository extends JpaRepository<ProgramBanner, Long> {

	boolean existsByProgramInfo_ProgNo(Long progNo);

	Optional<ProgramBanner> findByProgramInfo_ProgNo(Long progNo);

	@Query("""
			    SELECT pb FROM ProgramBanner pb
			    WHERE pb.programInfo.endDate >= :today
			""")
	List<ProgramBanner> findValidBanners(@Param("today") LocalDate today);

	// MAX 3개로 제한
	@Query("""
			    SELECT COUNT(pb) FROM ProgramBanner pb
			    WHERE pb.programInfo.endDate >= :today
			""")
	long countValidBanners(@Param("today") LocalDate today);

}
