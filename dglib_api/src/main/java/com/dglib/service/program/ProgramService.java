package com.dglib.service.program;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramApplyRequestDTO;
import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramRoomCheckDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.program.ProgramInfo;

public interface ProgramService {

	List<ProgramBannerDTO> getAllBanners(); // 배너 list 조회

	List<ProgramInfoDTO> getAllPrograms(); // 프로그램 list 조회

	ProgramInfoDTO getProgram(Long progNo); // 프로그램 상세 조회

	ProgramInfo getProgramEntity(Long progNo);

	void registerBanner(ProgramBannerDTO dto, MultipartFile file); // 배너 등록

	void deleteBanner(Long bno); // 배너 삭제

	void registerProgram(ProgramInfoDTO dto, MultipartFile file); // 프로그램 등록(파일 1개 포함)

	void updateProgram(Long progNo, ProgramInfoDTO dto, MultipartFile file); // 프로그램 수정

	void deleteProgram(Long progNo); // 프로그램 삭제

	void applyProgram(ProgramApplyRequestDTO dto);

	void cancelProgram(Long progUseNo); // 사용자 신청 취소

	boolean isAlreadyApplied(Long progNo, String mid); // 이미 신청 했는지 여부 확인

	boolean isAvailable(Long progNo); // 신청 가능 여부(프론트에서 버튼 비활성화용)

	boolean isAllRoomsOccupied(ProgramRoomCheckDTO request); // 모든 강의실이 예약되었는지 확인

	boolean isRoomAvailable(ProgramRoomCheckDTO request);

	// 사용 가능한 강의실 목록 조회
	Map<String, Boolean> getRoomAvailabilityStatus(ProgramRoomCheckDTO dto);

	// 프로그램 목록 조회
	Page<ProgramInfoDTO> getProgramList(Pageable pageable, String title, String content, String status);

	// 사용자용 목록 조회
	Page<ProgramInfoDTO> searchProgramList(Pageable pageable, String option, String query, String status);

	Page<ProgramInfoDTO> getUserProgramList(Member member, Pageable pageable);

	// 관리자용 목록 조회
	Page<ProgramInfoDTO> searchAdminProgramList(Pageable pageable, String option, String query, String status);

	// 사용자 신청 리스트
	Page<ProgramUseDTO> getUseListByMemberPaged(String mid, Pageable pageable);

	// 관리자용: 특정 프로그램의 신청자 목록 조회
	List<ProgramUseDTO> getApplicantsByProgram(Long progNo);
	
	//강의 기간이 끝나지않은 모든 프로그램
	public List<ProgramInfoDTO> searchNotEndProgramList();

}