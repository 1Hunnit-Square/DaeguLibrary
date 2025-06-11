package com.dglib.repository.program;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.program.ProgramUse;

public interface ProgramUseRepository extends JpaRepository<ProgramUse, Long>{
	
	boolean existsByProgramInfo_ProgNoAndMember_Mid(Long progNo, String mid);
	
	@Query("SELECT COUNT(p) FROM ProgramUse p WHERE p.programInfo.progNo = :progNo")
	int countByProgram(@Param("progNo") Long progNo);


}
