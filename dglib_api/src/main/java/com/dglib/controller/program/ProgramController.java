package com.dglib.controller.program;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

	@Value("${file.upload.path}")
	private String uploadPath;

	// 관리자용 Api
	// 1. 배너 목록 조회
	@GetMapping("/banners")
	public ResponseEntity<List<ProgramBannerDTO>> getAllBanners() {
		return ResponseEntity.ok(programService.getAllBanners());
	}

	// 1-1. 배너 등록
	@PostMapping("/banners/register")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<String> registerBanner(@ModelAttribute ProgramBannerDTO dto,
			@RequestParam("file") MultipartFile file) {
		programService.registerBanner(dto, file);
		return ResponseEntity.ok("배너 등록 완료");
	}

	// 1-2. 배너 삭제
	@DeleteMapping("/banners/delete/{bno}")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public ResponseEntity<Void> deleteBanner(@PathVariable Long bno) {
		programService.deleteBanner(bno);
		return ResponseEntity.noContent().build();
	}

	// 1-3. 배너 이미지 조회
	@GetMapping("/banners/view")
	public ResponseEntity<Resource> viewBannerImage(@RequestParam String filePath) {
		if (filePath == null || filePath.isBlank()) {
			return ResponseEntity.badRequest().build();
		}

		try {
			Path basePath = Paths.get(uploadPath).toAbsolutePath().normalize();
			Path fullPath = basePath.resolve(filePath).normalize();

			if (!Files.exists(fullPath)) {
				return ResponseEntity.notFound().build();
			}

			Resource resource = new UrlResource(fullPath.toUri());
			String contentType = Files.probeContentType(fullPath);

			return ResponseEntity.ok()
					.contentType(
							MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
					.body(resource);
		} catch (IOException e) {
			log.error("배너 이미지 조회 중 오류", e);
			return ResponseEntity.internalServerError().build();
		}
	}

	// ----------------------------------------------------------------
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

	// 9. 특정 프로그램의 신청 회원 리스트 조회
	@GetMapping("/{progNo}/applicants")
	public ResponseEntity<List<ProgramUseDTO>> getApplicantsByProgram(@PathVariable Long progNo) {
		return ResponseEntity.ok(programService.getApplicantsByProgram(progNo));
	}

	// 10. 프로그램 시설 등록
	@PostMapping("/room-status")
	public ResponseEntity<Map<String, Boolean>> getRoomAvailabilityStatus(@RequestBody ProgramRoomCheckDTO dto) {
		Map<String, Boolean> status = programService.getRoomAvailabilityStatus(dto);
		return ResponseEntity.ok(status);
	}

	// 파일 다운로드
	@GetMapping("/file/{progNo}")
	public ResponseEntity<Resource> downloadFile(@PathVariable Long progNo) {
		ProgramInfo program = programService.getProgramEntity(progNo);
		return fileUtil.getFile(program.getFilePath(), program.getOriginalName());
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

	// 4. 사용자 신청 내역 조회 (페이징)
	@GetMapping("/user/applied/page")
	public ResponseEntity<Page<ProgramUseDTO>> getUseListByMemberPaged(@RequestParam String mid, Pageable pageable) {

		return ResponseEntity.ok(programService.getUseListByMemberPaged(mid, pageable));
	}

	// 5. 사용자 신청 취소
	@DeleteMapping("/cancel/{progUseNo}")
	public ResponseEntity<Void> cancelProgram(@PathVariable Long progUseNo) {
		programService.cancelProgram(progUseNo);
		return ResponseEntity.noContent().build();
	}

	// 6. 사용자 프로그램 목록 조회
	@GetMapping("/user/list")
	public ResponseEntity<Page<ProgramInfoDTO>> getUserProgramList(@RequestParam(required = false) String option,
			@RequestParam(required = false) String query, @RequestParam(required = false) String status,
			Pageable pageable) {
		log.info("getUserProgramList called with option: {}, query: {}, status: {}, pageable: {}", option, query,
				status, pageable);
		Page<ProgramInfoDTO> result = programService.searchProgramList(pageable, option, query, status);
		log.info("Returned {} programs. Total elements: {}", result.getContent().size(), result.getTotalElements());
		return ResponseEntity.ok(result);
	}

	@GetMapping("/admin/notEnd")
	public ResponseEntity<List<ProgramInfoDTO>> getUserProgramList() {
		List<ProgramInfoDTO> result = programService.searchNotEndProgramList();
		return ResponseEntity.ok(result);
	}
	
}
