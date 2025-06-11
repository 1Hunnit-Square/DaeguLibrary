package com.dglib.controller.program;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.service.program.ProgramService;
import com.dglib.service.program.ProgramService.FileDownloadInfo;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

	private final ProgramService programService;

	@Value("${file.upload.path}")
	private String uploadBasePath;

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
	@GetMapping
	public ResponseEntity<Page<ProgramInfoDTO>> getProgramList(@RequestParam(required = false) String progName,
			@RequestParam(required = false) String content, @RequestParam(required = false) String status,
			Pageable pageable) {

		Page<ProgramInfoDTO> result = programService.getProgramList(pageable, progName, content, status);
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

	// 사용자용 API
	// 1. 프로그램 신청
	@PostMapping("/apply")
	public ResponseEntity<String> applyProgram(@RequestBody ProgramUseDTO dto) {
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

	// 4. 파일 다운로드
	@GetMapping("/file/{progNo}")
	public ResponseEntity<Resource> downloadProgramFile(@PathVariable Long progNo) throws IOException {
		FileDownloadInfo fileInfo = programService.downloadProgramFile(progNo);

		return ResponseEntity.ok().contentType(MediaType.parseMediaType(fileInfo.getContentType())) // Service에서 받은
																									// Content-Type 사용
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileInfo.getFilename() + "\"")
				.body(fileInfo.getResource());
	}

}
