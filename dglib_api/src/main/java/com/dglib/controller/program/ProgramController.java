package com.dglib.controller.program;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramApplyRequestDTO;
import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramRoomCheckDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.program.ProgramInfo;
import com.dglib.repository.member.MemberRepository;
import com.dglib.service.program.ProgramService;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

	private static final Logger log = LoggerFactory.getLogger(ProgramController.class);

	private final ProgramService programService;
	private final MemberRepository memberRepository;
	private final FileUtil fileUtil;

	// 관리자용 API
	// 1. 배너 목록 조회
	@GetMapping("/banners")
	public ResponseEntity<List<ProgramBannerDTO>> getAllBanners() {
		return ResponseEntity.ok(programService.getAllBanners());
	}

	// 2. 전체 프로그램 목록 조회 (신청 종료 기간 기준 필터링 없이 전체)
	@GetMapping("/all")
	public ResponseEntity<List<ProgramInfoDTO>> getAllPrograms() {
		return ResponseEntity.ok(programService.getAllPrograms());
	}

	// 3. 페이지네이션 + 검색 조건 포함 목록 조회
	@GetMapping("/admin/list")
	public ResponseEntity<Page<ProgramInfoDTO>> getAdminProgramList(@RequestParam(required = false) String option,
			@RequestParam(required = false) String query, @RequestParam(required = false) String status,
			Pageable pageable) {

		Page<ProgramInfoDTO> result = programService.searchAdminProgramList(pageable, option, query, status);
		return ResponseEntity.ok(result);
	}

	// 4. 프로그램 상세 조회
	@GetMapping("/{progNo}")
	public ResponseEntity<ProgramInfoDTO> getProgram(@PathVariable Long progNo) {
		return ResponseEntity.ok(programService.getProgram(progNo));
	}

	// 5. 프로그램 등록(파일 업로드 포함)
	@PostMapping("/register")
	public ResponseEntity<String> registerProgram(@ModelAttribute ProgramInfoDTO dto,
			@RequestParam(value = "file", required = false) MultipartFile file) {

		programService.registerProgram(dto, file);
		return ResponseEntity.ok("등록 완료");
	}

	// 6. 수정(파일 업데이트 포함)
	@PutMapping("/update/{progNo}")
	public ResponseEntity<Void> updateProgram(@PathVariable Long progNo, @ModelAttribute ProgramInfoDTO dto,
			@RequestParam(value = "file", required = false) MultipartFile file) {

		programService.updateProgram(progNo, dto, file);
		return ResponseEntity.ok().build();
	}

	// 7. 삭제
	@DeleteMapping("/delete/{progNo}")
	public ResponseEntity<Void> deleteProgram(@PathVariable Long progNo) {
		programService.deleteProgram(progNo);
		return ResponseEntity.noContent().build();
	}

	// 8. 장소 체크
	@PostMapping("/check-room")
	public ResponseEntity<Map<String, Boolean>> checkRoomAvailability(@RequestBody ProgramRoomCheckDTO request) {
		boolean full = programService.isAllRoomsOccupied(request);
		return ResponseEntity.ok(Map.of("full", full));
	}

	// 9. 관리자용 API - 특정 프로그램의 신청 회원 리스트 조회
	@GetMapping("/{progNo}/applicants")
	public ResponseEntity<List<ProgramUseDTO>> getApplicantsByProgram(@PathVariable Long progNo) {
		return ResponseEntity.ok(programService.getApplicantsByProgram(progNo));
	}

	// 10. 관리자 - 프로그램 시설 등록
	@PostMapping("/room-status")
	public ResponseEntity<Map<String, Boolean>> getRoomAvailabilityStatus(@RequestBody ProgramRoomCheckDTO dto) {
		Map<String, Boolean> status = programService.getRoomAvailabilityStatus(dto);
		return ResponseEntity.ok(status);
	}

	// 파일 다운로드
	@GetMapping("/file/{progNo}")
	public ResponseEntity<Resource> downloadFile(@PathVariable Long progNo) {
		ProgramInfo program = programService.getProgramEntity(progNo);
		return fileUtil.getFile(program.getFilePath(), program.getFileName());
	}

	// 사용자용 API
	// 1. 프로그램 신청
	@PostMapping("/apply")
	public ResponseEntity<String> applyProgram(@RequestBody ProgramApplyRequestDTO dto) {
		programService.applyProgram(dto);
		return ResponseEntity.ok("신청이 완료되었습니다.");
	}

	// 2. 신청 여부 확인(중복 신청 방지용)
	@GetMapping("/applied")
	public ResponseEntity<Boolean> isAlreadyApplied(@RequestParam Long progNo, @RequestParam String mid) {
		return ResponseEntity.ok(programService.isAlreadyApplied(progNo, mid));
	}

	// 3. 신청 가능 여부 확인(신청 마감 확인용)
	@GetMapping("/available/{progNo}")
	public ResponseEntity<Boolean> isAvailable(@PathVariable Long progNo) {
		return ResponseEntity.ok(programService.isAvailable(progNo));
	}

	// 6. 사용자 신청 리스트
	@GetMapping("/user/applied")
	public ResponseEntity<List<ProgramUseDTO>> getProgramUseList(@RequestParam String mid) {
		return ResponseEntity.ok(programService.getUseListByMember(mid));
	}

	// 7. 사용자 신청 취소
	@DeleteMapping("/cancel/{progUseNo}")
	public ResponseEntity<Void> cancelProgram(@PathVariable Long progUseNo) {
		programService.cancelProgram(progUseNo);
		return ResponseEntity.noContent().build();
	}

	// 8. 사용자 프로그램 목록 조회
	@GetMapping("/user/list")
	public ResponseEntity<Page<ProgramInfoDTO>> getUserProgramList(
	        @RequestParam(required = false) String option,
	        @RequestParam(required = false) String query,
	        @RequestParam(required = false) String status,
	        Pageable pageable) {
	    log.info("getUserProgramList called with option: {}, query: {}, status: {}, pageable: {}", option, query, status, pageable);
	    Page<ProgramInfoDTO> result = programService.searchProgramList(pageable, option, query, status);
	    log.info("Returned {} programs. Total elements: {}", result.getContent().size(), result.getTotalElements());
	    return ResponseEntity.ok(result);
	}

}
