package com.dglib.service.program;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramApplyRequestDTO;
import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramRoomCheckDTO;
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

	private String calculateStatus(LocalDateTime applyStartAt, LocalDateTime applyEndAt) {
		LocalDateTime now = LocalDateTime.now();

		if (now.isBefore(applyStartAt)) {
			return "신청전";
		} else if (now.isAfter(applyEndAt)) {
			return "신청마감";
		} else {
			return "신청중";
		}
	}

	// 프로그램 목록 조회 (페이지네이션 + 검색 조건 포함)
	@Override
	public Page<ProgramInfoDTO> getProgramList(Pageable pageable, String progName, String content, String status) {
		// 모든 조건이 비어 있으면 전체 조회
		boolean noFilter = (progName == null || progName.isBlank()) && (content == null || content.isBlank())
				&& (status == null || status.isBlank());

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
			dto.setOriginalName(program.getFileName());
			dto.setStatus(calculateStatus(program.getApplyStartAt(), program.getApplyEndAt()));
			dto.setCreatedAt(program.getCreatedAt());

			return dto;
		});
	}

	// 프로그램 목록 검색
	@Override
	public Page<ProgramInfoDTO> searchProgramList(Pageable pageable, String option, String query, String status) {
		// 검색 타입에 따라 searchType 설정
		option = (option != null && !option.isBlank()) ? option : "all";
		query = (query != null && !query.isBlank()) ? query : null;
		status = (status != null && !status.isBlank()) ? status : null;

		String searchType = null;
		if ("progName".equals(option) || "teachName".equals(option)) {
			searchType = option;
		}

		Page<ProgramInfo> result = infoRepository.searchAdminPrograms(searchType, query, status, null, null, pageable);

		return result.map(p -> {
			ProgramInfoDTO dto = modelMapper.map(p, ProgramInfoDTO.class);
			dto.setCurrent(useRepository.countByProgram(p.getProgNo()));
			dto.setOriginalName(p.getFileName());
			dto.setStatus(calculateStatus(p.getApplyStartAt(), p.getApplyEndAt()));

			return dto;
		});
	}

	// 배너 리스트 조회
	@Override
	public List<ProgramBannerDTO> getAllBanners() {
		return bannerRepository.findAll().stream().map(banner -> modelMapper.map(banner, ProgramBannerDTO.class))
				.collect(Collectors.toList());
	}

	@Override
	public ProgramInfo getProgramEntity(Long progNo) {
		return infoRepository.findById(progNo).orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));
	}

	// 프로그램 리스트 조회
	@Override
	public List<ProgramInfoDTO> getAllPrograms() {
		LocalDate today = LocalDate.now();
		return infoRepository.findAll().stream().filter(info -> !info.getApplyEndAt().toLocalDate().isBefore(today))
				.map(info -> {
					ProgramInfoDTO dto = modelMapper.map(info, ProgramInfoDTO.class);

					return dto;
				}).collect(Collectors.toList());
	}

	// 프로그램 상세 조회
	@Override
	public ProgramInfoDTO getProgram(Long progNo) {
		ProgramInfo info = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		ProgramInfoDTO dto = modelMapper.map(info, ProgramInfoDTO.class);

		dto.setOriginalName(info.getFileName());

		dto.setStatus(calculateStatus(info.getApplyStartAt(), info.getApplyEndAt()));

		dto.setCurrent(useRepository.countByProgram(progNo));

		return dto;
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

		ProgramInfo origin = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		String originalFilePath = origin.getFilePath();
		String originalFilename = origin.getFileName();

		if (file != null && !file.isEmpty()) {
			if (originalFilePath != null && !originalFilePath.isEmpty()) {
				try {
					fileUtil.deleteFiles(List.of(originalFilePath));
				} catch (RuntimeException e) {
					System.err.println("기존 파일 삭제 실패: " + originalFilePath);
					throw e;
				}
			}
		}

		modelMapper.map(dto, origin);

		if (file == null || file.isEmpty()) {
			origin.setFilePath(originalFilePath);
			origin.setFileName(originalFilename);
		} else {
			setFileInfo(origin, file);
		}

		infoRepository.save(origin);
	}

	// 파일 처리 공통 메서드
	private void setFileInfo(ProgramInfo info, MultipartFile file) {

		if (file != null && !file.isEmpty()) {
			// 새롭게 추가된 파일 확장자 직접 검사 로직
			String originalFilename = file.getOriginalFilename();
			if (originalFilename == null || originalFilename.isEmpty()) {
				throw new IllegalArgumentException("파일 이름이 존재하지 않습니다.");
			}

			String lowerCaseFilename = originalFilename.toLowerCase();
			boolean isAllowedDocument = lowerCaseFilename.endsWith(".hwp") || lowerCaseFilename.endsWith(".pdf");

			if (!isAllowedDocument) {
				throw new IllegalArgumentException("hwp 또는 pdf 파일만 업로드 가능합니다.");
			}
			// 여기까지 파일 확장자 검사 로직 추가

			String oldPath = info.getFilePath();

			if (oldPath != null && !oldPath.isEmpty()) {
				try {
					fileUtil.deleteFiles(List.of(oldPath));
					System.out.println("기존 파일 삭제: " + oldPath);
				} catch (RuntimeException e) {
					System.err.println("기존 파일 삭제 실패: " + oldPath + " - " + e.getMessage());
					throw e;
				}
			}

			List<Object> uploaded = fileUtil.saveFiles(List.of(file), "program");

			@SuppressWarnings("unchecked")
			Map<String, String> fileInfo = (Map<String, String>) uploaded.get(0);
			System.out.println("업로드된 파일 originalName: " + fileInfo.get("originalName"));
			info.setFileName(fileInfo.get("originalName"));
			info.setFilePath(fileInfo.get("filePath"));
		}
	}

	// 프로그램 삭제
	@Override
	public void deleteProgram(Long progNo) {
		ProgramInfo programToDelete = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		if (programToDelete.getCreatedAt() == null) {
			programToDelete.setCreatedAt(LocalDateTime.now());
		}

		// 신청자 데이터 삭제
		List<ProgramUse> uses = useRepository.findByProgramInfo_ProgNo(progNo);
		useRepository.deleteAll(uses);

		// 파일 삭제
		if (programToDelete.getFilePath() != null && !programToDelete.getFilePath().isEmpty()) {
			try {
				fileUtil.deleteFiles(List.of(programToDelete.getFilePath()));
			} catch (RuntimeException e) {
				throw new RuntimeException("파일 삭제 중 문제가 발생했습니다. 관리자에게 문의해주세요.");
			}
		}

		infoRepository.delete(programToDelete);
	}

	// 프로그램 중복 신청 방지 및 대상자 필터링
	@Override
	public void applyProgram(ProgramApplyRequestDTO dto) {
		Long progNo = dto.getProgNo();
		String mid = dto.getMid();

		// 로그인 여부 확인 (예외 처리를 AuthException 로 사용해야 할까?)
		if (mid == null || mid.isBlank()) {
			throw new IllegalStateException("로그인한 사용자만 신청할 수 있습니다.");
		}

		// 중복 신청 방지
		if (isAlreadyApplied(progNo, mid)) {
			throw new IllegalStateException("이미 신청한 프로그램입니다.");
		}

		// 프로그램 정보 조회
		ProgramInfo program = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		LocalDateTime now = LocalDateTime.now();

		if (now.isBefore(program.getApplyStartAt())) {
			throw new IllegalStateException("신청 기간이 아닙니다.");
		}

		if (now.isAfter(program.getApplyEndAt())) {
			throw new IllegalStateException("신청 기간이 종료되었습니다.");
		}

		// 회원 정보 확인
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new IllegalArgumentException("회원 정보가 존재하지 않습니다."));

		// 신청 대상자 확인
		if (!isEligible(program.getTarget(), member)) {
			throw new IllegalStateException("신청 대상이 아닙니다.");
		}

		// 신청 저장
		ProgramUse programUse = ProgramUse.builder().programInfo(program).member(member).applyAt(LocalDateTime.now())
				.build();

		useRepository.save(programUse);

	}

	// 관리자용 신청자 목록 조회
	@Override
	public List<ProgramUseDTO> getApplicantsByProgram(Long progNo) {
		List<ProgramUse> list = useRepository.findWithMemberByProgramInfo_ProgNo(progNo); // join fetch 사용

		return list.stream().map(use -> {
			ProgramInfo info = use.getProgramInfo();
			Member member = use.getMember();

			String status = info.getEndDate().isBefore(LocalDate.now()) ? "강의종료" : "신청완료";

			List<Integer> dayOfWeekIntList = info.getDaysOfWeek();

			return ProgramUseDTO.builder().progUseNo(use.getProgUseNo()).applyAt(use.getApplyAt())
					.progName(info.getProgName()).teachName(info.getTeachName()).startDate(info.getStartDate())
					.endDate(info.getEndDate()).startTime(info.getStartTime().toString())
					.endTime(info.getEndTime().toString()).daysOfWeek(dayOfWeekIntList).room(info.getRoom())
					.capacity(info.getCapacity()).current(useRepository.countByProgram(info.getProgNo())).status(status)
					.progNo(info.getProgNo()).mid(member != null ? member.getMid() : null)
					.name(member != null ? member.getName() : null).email(member != null ? member.getEmail() : null)
					.phone(member != null ? member.getPhone() : null).build();
		}).collect(Collectors.toList());
	}

	// 모든 시설이 해당 기간과 요일에 이미 예약되어 있는지 확인
	@Override
	public boolean isAllRoomsOccupied(ProgramRoomCheckDTO request) {
		List<String> rooms = List.of("문화교실1", "문화교실2", "문화교실3");

		List<Integer> dayInts = request.getDaysOfWeek();

		long count = rooms.stream().filter(room -> infoRepository.existsByRoomAndOverlap(room, request.getStartDate(),
				request.getEndDate(), dayInts)).count();

		return count >= 3;
	}

	// 가능한 강의실 목록 리턴
	@Override
	public List<String> getAvailableRooms(ProgramRoomCheckDTO request) {
		List<String> rooms = List.of("문화교실1", "문화교실2", "문화교실3");

		List<Integer> dayInts = request.getDaysOfWeek();

		return rooms.stream().filter(room -> !infoRepository.existsByRoomAndOverlap(room, request.getStartDate(),
				request.getEndDate(), dayInts)).toList();
	}

	// 신청 대상자 여부 판단
	private boolean isEligible(String target, Member member) {
		if (target == null || target.isBlank() || member.getBirthDate() == null) {
			return true;
		}

		int age = Period.between(member.getBirthDate(), LocalDate.now()).getYears();

		return switch (target) {
		case "성인" -> age >= 19;
		case "청소년" -> age >= 9 && age <= 18;
		default -> false;
		};
	}

	// 이미 신청 했는지 여부 확인
	@Override
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

	// 사용자 프로그램 신청 취소
	@Override
	public void cancelProgram(Long progUseNo) {
		ProgramUse programUse = useRepository.findById(progUseNo)
				.orElseThrow(() -> new IllegalArgumentException("신청 내역이 존재하지 않습니다."));

		useRepository.delete(programUse);
	}

	// 사용자 신청 리스트
	@Override
	public List<ProgramUseDTO> getUseListByMember(String mid) {
		List<ProgramUse> list = useRepository.findByMember_Mid(mid);

		return list.stream().map(use -> {
			ProgramInfo info = use.getProgramInfo();

			String status = info.getEndDate().isBefore(LocalDate.now()) ? "강의종료" : "신청완료";

			List<Integer> dayOfWeekIntList = info.getDaysOfWeek();

			return ProgramUseDTO.builder().progUseNo(use.getProgUseNo()).applyAt(use.getApplyAt())
					.progNo(info.getProgNo()).mid(use.getMember().getMid()).progName(info.getProgName())
					.teachName(info.getTeachName()).startDate(info.getStartDate()).endDate(info.getEndDate())
					.startTime(info.getStartTime().toString()).endTime(info.getEndTime().toString())
					.daysOfWeek(dayOfWeekIntList).room(info.getRoom()).capacity(info.getCapacity())
					.current(useRepository.countByProgram(info.getProgNo())).status(status).build();
		}).collect(Collectors.toList());

	}

}