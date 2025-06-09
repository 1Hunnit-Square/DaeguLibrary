package com.dglib.service.program;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramApplyRequestDTO;
import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramRoomCheckDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.program.ProgramInfo;

import lombok.AllArgsConstructor;
import lombok.Data;

public interface ProgramService {

	List<ProgramBannerDTO> getAllBanners(); // 배너 list 조회
	List<ProgramInfoDTO> getAllPrograms();  // 프로그램 list 조회
	ProgramInfoDTO getProgram(Long progNo); // 프로그램 상세 조회
	ProgramInfo getProgramEntity(Long progNo);

	void registerProgram(ProgramInfoDTO dto, MultipartFile file); // 프로그램 등록(파일 1개 포함)
	void updateProgram(Long progNo, ProgramInfoDTO dto, MultipartFile file); // 프로그램 수정
	void deleteProgram(Long progNo); // 프로그램 삭제
	void applyProgram(ProgramApplyRequestDTO dto);
	void cancelProgram(Long progUseNo); // 사용자 신청 취소
	
	boolean isAlreadyApplied(Long progNo, String mid); // 이미 신청 했는지 여부 확인
	boolean isAvailable(Long progNo); // 신청 가능 여부(프론트에서 버튼 비활성화용)
	boolean isAllRoomsOccupied(ProgramRoomCheckDTO request); // 모든 강의실이 예약되었는지 확인

	// 사용 가능한 강의실 목록 조회
	List<String> getAvailableRooms(ProgramRoomCheckDTO request);

	// 프로그램 목록 조회 (페이지네이션 + 검색 조건 포함)
	Page<ProgramInfoDTO> getProgramList(Pageable pageable, String title, String content, String status);

	// 프로그램 목록 검색 (option + query 방식)
	Page<ProgramInfoDTO> searchProgramList(Pageable pageable, String option, String query, String status);

	// 사용자 신청 리스트
	List<ProgramUseDTO> getUseListByMember(String mid);

	// 파일 다운로드 로직 추가
	FileDownloadInfo downloadProgramFile(Long progNo) throws IOException;

	// 파일 다운로드 정보를 담을 내부 클래스
	@Data
	@AllArgsConstructor
	class FileDownloadInfo {
		private Resource resource;
		private String filename;
		private String contentType; // Content-Type을 함께 반환하도록 추가
	}
}