package com.dglib.repository.program;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.member.Member;
import com.dglib.entity.program.ProgramUse;

public interface ProgramUseRepository extends JpaRepository<ProgramUse, Long> {

	boolean existsByProgramInfo_ProgNoAndMember_Mid(Long progNo, String mid);

	@Query("SELECT COUNT(p) FROM ProgramUse p WHERE p.programInfo.progNo = :progNo")
	int countByProgram(@Param("progNo") Long progNo);

	List<ProgramUse> findByMember_Mid(String mid);

	Page<ProgramUse> findByMember_Mid(String mid, Pageable pageable);

	List<ProgramUse> findByProgramInfo_ProgNo(Long progNo);

	Page<ProgramUse> findByMember(Member member, Pageable pageable);

	// member 함께 로딩해서 DTO 변환시 NPE(널포인터예외) 방지
	@Query("SELECT pu FROM ProgramUse pu JOIN FETCH pu.member WHERE pu.programInfo.progNo = :progNo")
	List<ProgramUse> findWithMemberByProgramInfo_ProgNo(@Param("progNo") Long progNo);

	// ---------- 탈퇴 회원 프로그램 신청 내역 삭제 ----------

	// 특정 회원 프로그램 신청 내역 모두 삭제(DB에서 바로 DELETE쿼리 실행)
	void deleteByMember_Mid(String mid);

	// 특정 회원 프로그램 신청 내역을 모두 조회(필요시 사용하면 됨, 현재는 필요 없음)
	List<ProgramUse> findAllByMember_Mid(String mid);
}
