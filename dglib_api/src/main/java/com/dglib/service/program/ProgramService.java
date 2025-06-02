package com.dglib.service.program;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.program.ProgramInfo;

public interface ProgramService {
	
	List<ProgramBannerDTO> getAllBanners(); // 배너 list 조회
	List<ProgramInfoDTO> getAllPrograms();  // 프로그램 list 조회 
	ProgramInfoDTO getProgram(Long progNo); // 프로그램 상세 조회 
	ProgramInfo getProgramEntity(Long progNo);

	void registerProgram(ProgramInfoDTO dto, MultipartFile file); // 프로그램 등록(파일 1개 포함)
	void updateProgram(Long progNo, ProgramInfoDTO dto, MultipartFile file); // 프로그램 수정
	void deleteProgram(Long progNo); // 프로그램 삭제
	void applyProgram(ProgramUseDTO dto); // 프로그램 중복 신청 방지 및 대상자 필터링
	
	boolean isAlreadyApplied(Long progNo, String mid); // 이미 신청 했는지 여부 확인
	boolean isAvailable(Long progNo); // 신청 가능 여부(프론트에서 버튼 비활성화용)
	
	// 프로그램 목록 조회 (페이지네이션 + 검색 조건 포함)
	 Page<ProgramInfoDTO> getProgramList(Pageable pageable, String searchType, String keyword);

	
}
