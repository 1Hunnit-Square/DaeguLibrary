package com.dglib.service.program;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.program.ProgramInfo;
import com.dglib.entity.program.ProgramUse;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.program.ProgramBannerRepository;
import com.dglib.repository.program.ProgramInfoRepository;
import com.dglib.repository.program.ProgramUseRepository;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class ProgramServiceImpl implements ProgramService {

	private final ProgramBannerRepository bannerRepository;
	private final ProgramInfoRepository infoRepository;
	private final ProgramUseRepository useRepository;
	private final MemberRepository memberRepository;
	private final FileUtil fileUtil;
	private final ModelMapper modelMapper;

	// 프로그램 목록 조회 (페이지네이션 + 검색 조건 포함)
	@Override
	public Page<ProgramInfoDTO> getProgramList(Pageable pageable, String progName, String content, String status) {
	    // 모든 조건이 비어 있으면 전체 조회
	    boolean noFilter = (progName == null || progName.isBlank()) &&
	                       (content == null || content.isBlank()) &&
	                       (status == null || status.isBlank());

	    Page<ProgramInfo> result;

	    if (noFilter) {
	        result = infoRepository.findAll(pageable);
	    } else {
	        result = infoRepository.searchProgram(progName, content, status, pageable);
	    }

	    return result.map(program -> {
	        ProgramInfoDTO dto = modelMapper.map(program, ProgramInfoDTO.class);
	        int applicants = useRepository.countByProgram(program.getProgNo());
	        dto.setCurrent(applicants);

	        return dto;
	    });
	}


	// 배너 리스트 조회
	@Override
	public List<ProgramBannerDTO> getAllBanners() {
		return bannerRepository.findAll().stream().map(banner -> modelMapper.map(banner, ProgramBannerDTO.class))
				.collect(Collectors.toList());
	}

	// 프로그램 리스트 조회
	@Override
	public List<ProgramInfoDTO> getAllPrograms() {
		LocalDate today = LocalDate.now();
		return infoRepository.findAll().stream().filter(info -> !info.getApplyEndAt().toLocalDate().isBefore(today))
				.map(info -> modelMapper.map(info, ProgramInfoDTO.class)).collect(Collectors.toList());
	}

	// 프로그램 상세 조회
	@Override
	public ProgramInfoDTO getProgram(Long progNo) {
		ProgramInfo info = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));
		return modelMapper.map(info, ProgramInfoDTO.class);
	}

	@Override
	public ProgramInfo getProgramEntity(Long progNo) {
		return infoRepository.findById(progNo).orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

	}

	// 프로그램 등록
	@Override
	public void registerProgram(ProgramInfoDTO dto, MultipartFile file) {
		ProgramInfo info = modelMapper.map(dto, ProgramInfo.class);
		setFileInfo(info, file);
		infoRepository.save(info);
	}

	// 프로그램 수정
	@Override
	public void updateProgram(Long progNo, ProgramInfoDTO dto, MultipartFile file) {
		ProgramInfo existing = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		Long existingProgNo = existing.getProgNo();
		modelMapper.map(dto, existing);
		existing.setProgNo(existingProgNo);
		setFileInfo(existing, file);
		infoRepository.save(existing); // 수정된 엔티티 저장
	}

	// 파일 처리 공통 메서드
	private void setFileInfo(ProgramInfo info, MultipartFile file) {
		if (file != null && !file.isEmpty()) {
			String name = file.getOriginalFilename();

			if (name == null || !(name.toLowerCase().endsWith(".pdf") || name.toLowerCase().endsWith(".hwp"))) {
				throw new IllegalArgumentException("허용되지 않은 파일 형식입니다. PDF 또는 HWP만 가능합니다.");
			}

			List<Object> uploaded = fileUtil.saveFiles(List.of(file), "program");
			Map<String, String> fileInfo = (Map<String, String>) uploaded.get(0);
			info.setFilename(fileInfo.get("originalName")); // FileUtil에서 originalName을 사용하므로 그대로 사용
			info.setFilePath(fileInfo.get("filePath"));
		}
	}

	// 프로그램 삭제
	@Override
	public void deleteProgram(Long progNo) {
		ProgramInfo programToDelete = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));
		if (programToDelete.getFilePath() != null && !programToDelete.getFilePath().isEmpty()) {
			try {
				fileUtil.deleteFiles(List.of(programToDelete.getFilePath()));
			} catch (RuntimeException e) {
				System.err.println("파일 삭제 실패: " + programToDelete.getFilePath() + " - " + e.getMessage());
				throw e;
			}
		}
		infoRepository.deleteById(progNo);
	}

	// 프로그램 중복 신청 방지 및 대상자 필터링
	@Override
	public void applyProgram(ProgramUseDTO dto) {
		Long progNo = dto.getProgNo();
		String mid = dto.getMid();

		if (isAlreadyApplied(progNo, mid)) {
			throw new IllegalStateException("이미 신청한 프로그램입니다.");
		}

		ProgramInfo program = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));
		if (program.getApplyEndAt().toLocalDate().isBefore(LocalDate.now())) {
			throw new IllegalStateException("신청 기간이 종료되었습니다.");
		}

		Member member = memberRepository.findById(mid).orElseThrow(() -> new IllegalArgumentException("회원 정보 없음"));

		if (!isEligible(program.getTarget(), member)) {
			throw new IllegalStateException("신청 대상이 아닙니다.");
		}

		ProgramUse use = ProgramUse.builder().programInfo(program).member(member).applyAt(LocalDateTime.now()).build();

		useRepository.save(use);

	}

	// 신청 대상자 여부 판단
	private boolean isEligible(String target, Member member) {
		if (target == null || target.isBlank())
			return true;

		if (target.equals("성인")) {
			return member.getBirthDate().plusYears(19).isBefore(LocalDate.now());
		} else if (target.equals("청소년")) {
			return member.getBirthDate().plusYears(19).isAfter(LocalDate.now());
		}

		return true;
	}

	// 이미 신청 했는지 여부 확인
	public boolean isAlreadyApplied(Long progNo, String mid) {
		return useRepository.existsByProgramInfo_ProgNoAndMember_Mid(progNo, mid);
	}

	// 신청 가능 여부(프론트에서 버튼 비활성화용)
	@Override
	public boolean isAvailable(Long progNo) {
		ProgramInfo program = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		return program.getApplyEndAt().toLocalDate().isAfter(LocalDate.now());
	}

	// 파일 다운로드 로직 구현
	@Override
	public FileDownloadInfo downloadProgramFile(Long progNo) throws IOException {
		ProgramInfo info = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		ResponseEntity<Resource> fileUtilResponse = fileUtil.getFile(info.getFilePath(), null); // type은 null로 전달 (썸네일이
																								// 아니므로)

		if (!fileUtilResponse.getStatusCode().is2xxSuccessful()) {
			throw new IOException("파일 다운로드 실패: " + fileUtilResponse.getStatusCode());
		}

		Resource resource = fileUtilResponse.getBody();
		if (resource == null || !resource.exists()) {
			throw new IllegalArgumentException("파일을 찾을 수 없거나 접근할 수 없습니다: " + info.getFilePath());
		}

		// Content-Type 추출 (FileUtil의 ResponseEntity에서 가져옴)
		String contentType = fileUtilResponse.getHeaders().getContentType() != null
				? fileUtilResponse.getHeaders().getContentType().toString()
				: MediaType.APPLICATION_OCTET_STREAM_VALUE;

		// FileDownloadInfo 객체를 생성하여 반환
		return new FileDownloadInfo(resource, info.getFilename(), contentType);
	}
}