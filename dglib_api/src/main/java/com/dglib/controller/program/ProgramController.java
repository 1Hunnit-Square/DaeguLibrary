package com.dglib.controller.program;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.program.ProgramInfo;
import com.dglib.service.program.ProgramService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

//	private static final Logger LOGGER = LoggerFactory.getLogger(ProgramController.class);
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
	public ResponseEntity<Page<ProgramInfoDTO>> getProgramList(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String progName,
			@RequestParam(required = false) String content) {
		Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "progNo"));
		return ResponseEntity.ok(programService.getProgramList(pageable, progName, content));

	}

	// 4. 프로그램 상세 조회
	@GetMapping("/{progNo}")
	public ResponseEntity<ProgramInfoDTO> getProgram(@PathVariable Long progNo) {
		return ResponseEntity.ok(programService.getProgram(progNo));
	}

	// 5. 프로그램 등록
	@PostMapping("/register")
	public ResponseEntity<Void> registerProgram(@RequestBody ProgramInfoDTO dto) {
		programService.registerProgram(dto, null);
		return ResponseEntity.ok().build();
	}

	// 6. 수정
	@PutMapping("/update/{progNo}")
	public ResponseEntity<Void> updateProgram(@PathVariable Long progNo, @RequestBody ProgramInfoDTO dto) {
		programService.updateProgram(progNo, dto, null);
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
	public ResponseEntity<Void> applyProgram(@RequestBody ProgramUseDTO dto) {
		programService.applyProgram(dto);
		return ResponseEntity.ok().build();
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
		ProgramInfo info = programService.getProgramEntity(progNo); // Entity 직접 가져오는 메서드 필요
		String fullPath = Paths.get(uploadBasePath, info.getFilePath()).toString(); // ex: upload/program/abc.pdf

		File file = new File(fullPath);
		if (!file.exists()) {
			return ResponseEntity.notFound().build();
		}

		Resource resource = new InputStreamResource(new FileInputStream(file));
		return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + info.getFilename() + "\"")
				.body(resource);
	}

}
