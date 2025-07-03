package com.dglib.service.program;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.program.ProgramApplyRequestDTO;
import com.dglib.dto.program.ProgramBannerDTO;
import com.dglib.dto.program.ProgramInfoDTO;
import com.dglib.dto.program.ProgramRoomCheckDTO;
import com.dglib.dto.program.ProgramUseDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.program.ProgramBanner;
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

	private static final Logger log = LoggerFactory.getLogger(ProgramServiceImpl.class);

	private final ProgramBannerRepository bannerRepository;
	private final ProgramInfoRepository infoRepository;
	private final ProgramUseRepository useRepository;
	private final MemberRepository memberRepository;
	private final FileUtil fileUtil;
	private final ModelMapper modelMapper;

	private static final String[] WEEK_KO = { "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" };

	private List<String> convertToDayNames(List<Integer> days) {
		return days.stream().map(num -> WEEK_KO[num % 7]).collect(Collectors.toList());
	}

	private String calculateStatus(LocalDateTime applyStartAt, LocalDateTime applyEndAt) {
		LocalDateTime now = LocalDateTime.now();
		LocalDate applyStartDate = applyStartAt.toLocalDate();
		LocalDate applyEndDate = applyEndAt.toLocalDate();

		if (now.isBefore(applyStartAt)) {
			return "신청전";
		} else if (now.isAfter(applyEndAt)) {
			return "신청마감";
		} else {
			return "신청중";
		}
	}

	// 수업 날짜 생성 메서드 (요일 포함된 실제 수업일 계산)
	private List<LocalDate> generateClassDates(LocalDate start, LocalDate end, List<Integer> daysOfWeek) {
		List<LocalDate> dates = new ArrayList<>();
		for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
			if (daysOfWeek.contains(date.getDayOfWeek().getValue())) {
				dates.add(date);
			}
		}
		return dates;
	}

	// 프로그램 등록
	@Override
	public void registerProgram(ProgramInfoDTO dto, MultipartFile file) {
		if (dto.getDaysOfWeek() == null || dto.getDaysOfWeek().isEmpty()) {
			throw new IllegalArgumentException("요일 정보가 누락되었습니다.");
		}

		ProgramInfo info = modelMapper.map(dto, ProgramInfo.class);
		info.setCreatedAt(LocalDateTime.now());
		info.setStatus(calculateStatus(dto.getApplyStartAt(), dto.getApplyEndAt()));
		info.setDaysOfWeek(dto.getDaysOfWeek());

		setFileInfo(info, file);
		infoRepository.save(info);

	}

	// 프로그램 수정
	@Override
	public void updateProgram(Long progNo, ProgramInfoDTO dto, MultipartFile file) {

		ProgramInfo origin = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		// 기존 파일 경로, 이름 백업
		String originalFilePath = origin.getFilePath();
		String originalFileName = origin.getOriginalName();

		// DTO → 엔티티 매핑
		LocalDateTime originalCreatedAt = origin.getCreatedAt();
		modelMapper.map(dto, origin);
		origin.setCreatedAt(originalCreatedAt);

		// 파일이 비어있지 않다면 기존 파일 삭제 후 새 파일 저장
		if (file != null && !file.isEmpty()) {
			if (originalFilePath != null && !originalFilePath.isEmpty()) {
				fileUtil.deleteFiles(List.of(originalFilePath));
			}
			setFileInfo(origin, file);

		} else {
			origin.setFilePath(dto.getFilePath() != null ? dto.getFilePath() : originalFilePath);
			origin.setOriginalName(dto.getOriginalName() != null ? dto.getOriginalName() : originalFileName);
		}

		infoRepository.save(origin);
	}

	// 프로그램 삭제
	@Override
	public void deleteProgram(Long progNo) {
		ProgramInfo programToDelete = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		// 연결된 배너 먼저 삭제
		bannerRepository.findByProgramInfo_ProgNo(progNo).ifPresent(banner -> {
			String imageUrl = banner.getImageUrl();
			if (imageUrl != null) {
				String fileName = Paths.get(imageUrl).getFileName().toString();
				String parent = Paths.get(imageUrl).getParent().toString();
				String thumbnailPath = parent + "/s_" + fileName;
				fileUtil.deleteFiles(List.of(imageUrl, thumbnailPath));
			}
			bannerRepository.delete(banner);
		});

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

		// 프로그램 삭제
		infoRepository.delete(programToDelete);
	}

	// 관리자 페이지(복합 필터) - 관리자 일반 목록
	@Override
	public Page<ProgramInfoDTO> getProgramList(Pageable pageable, String progName, String content, String status) {
		boolean noFilter = (progName == null || progName.isBlank()) && (content == null || content.isBlank());

		Page<ProgramInfo> result = noFilter ? infoRepository.findAll(pageable)
				: infoRepository.searchProgram(progName, content, pageable);

		final String finalStatus = (status != null && !status.isBlank()) ? status : null;

		List<ProgramInfoDTO> filteredList = result.getContent().stream().map(program -> {
			ProgramInfoDTO dto = modelMapper.map(program, ProgramInfoDTO.class);
			dto.setCurrent(useRepository.countByProgram(program.getProgNo()));
			dto.setOriginalName(program.getOriginalName());
			String calculatedStatus = calculateStatus(program.getApplyStartAt(), program.getApplyEndAt());
			dto.setStatus(calculatedStatus);
			dto.setCreatedAt(program.getCreatedAt());
			dto.setDayNames(convertToDayNames(program.getDaysOfWeek()));
			return dto;
		}).filter(dto -> finalStatus == null || finalStatus.equals(dto.getStatus())).toList();

		return new PageImpl<>(filteredList, pageable, filteredList.size());
	}

	// 사용자 검색 전용
	@Override
	public Page<ProgramInfoDTO> searchProgramList(Pageable pageable, String option, String query, String status) {

		option = (option != null && !option.isBlank()) ? option : "all";
		query = (query != null && !query.isBlank()) ? query : null;
		status = (status != null && !status.isBlank()) ? status : null;

		String searchType = (query != null && !query.isBlank()
				&& ("progName".equals(option) || "content".equals(option) || "all".equals(option))) ? option : null;

		Page<ProgramInfo> result = infoRepository.searchPrograms(searchType, query, status, null, null, pageable);

		return result.map(p -> {
			ProgramInfoDTO dto = modelMapper.map(p, ProgramInfoDTO.class);
			dto.setCurrent(useRepository.countByProgram(p.getProgNo()));
			dto.setOriginalName(p.getOriginalName());
			dto.setStatus(calculateStatus(p.getApplyStartAt(), p.getApplyEndAt()));
			dto.setDayNames(convertToDayNames(p.getDaysOfWeek()));
			return dto;
		});

	}

	@Override
	public Page<ProgramInfoDTO> getUserProgramList(Member member, Pageable pageable) {
		// 회원이 신청한 ProgramUse 목록을 기준으로 ProgramInfo 가져오기
		Page<ProgramUse> uses = useRepository.findByMember(member, pageable);
		Page<ProgramInfoDTO> dtoPage = uses.map(use -> modelMapper.map(use.getProgramInfo(), ProgramInfoDTO.class));

		return dtoPage;
	}

	// 관리자 검색 전용
	@Override
	public Page<ProgramInfoDTO> searchAdminProgramList(Pageable pageable, String option, String query, String status) {
		option = (option != null && !option.isBlank()) ? option : "all";
		query = (query != null && !query.isBlank()) ? query : null;
		status = (status != null && !status.isBlank()) ? status : null;
		String searchType = ("progName".equals(option) || "teachName".equals(option)) ? option : null;

		Page<ProgramInfo> result = infoRepository.searchAdminPrograms(searchType, query, status, null, null, pageable);

		return result.map(p -> {
			ProgramInfoDTO dto = modelMapper.map(p, ProgramInfoDTO.class);
			dto.setCurrent(useRepository.countByProgram(p.getProgNo()));
			dto.setOriginalName(p.getOriginalName());
			dto.setStatus(calculateStatus(p.getApplyStartAt(), p.getApplyEndAt()));
			dto.setDayNames(convertToDayNames(p.getDaysOfWeek()));
			return dto;
		});
	}

	public List<ProgramInfoDTO> searchNotEndProgramList() {
		Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
		List<ProgramInfo> infoList = infoRepository.findByEndDateGreaterThanEqual(LocalDate.now(), sort);
		return infoList.stream().map(p -> {
			ProgramInfoDTO dto = modelMapper.map(p, ProgramInfoDTO.class);
			dto.setCurrent(useRepository.countByProgram(p.getProgNo()));
			return dto;
		}).collect(Collectors.toList());

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
					dto.setDayNames(convertToDayNames(info.getDaysOfWeek()));
					return dto;
				}).collect(Collectors.toList());
	}

	// 프로그램 상세 조회
	@Override
	public ProgramInfoDTO getProgram(Long progNo) {
		ProgramInfo info = infoRepository.findById(progNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));
		ProgramInfoDTO dto = modelMapper.map(info, ProgramInfoDTO.class);
		dto.setOriginalName(info.getOriginalName());
		dto.setStatus(calculateStatus(info.getApplyStartAt(), info.getApplyEndAt()));
		dto.setCurrent(useRepository.countByProgram(progNo));
		dto.setDayNames(convertToDayNames(info.getDaysOfWeek()));
		return dto;
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

		boolean isMemberPunish = member.getState() == MemberState.PUNISH;
		boolean isLeave = member.getState() == MemberState.LEAVE;

		if (isMemberPunish) {
			throw new IllegalStateException("회원이 정지 상태로 인해 프로그램을 신청할 수 없습니다.");
		}
		if (isLeave) {
			throw new IllegalStateException("탈퇴한 계정은 신청할 수 없습니다.");
		}

		// 신청 대상자 확인
		if (!isEligible(program.getTarget(), member)) {
			throw new IllegalStateException("신청 대상이 아닙니다.");
		}

		// 신청 저장
		ProgramUse programUse = ProgramUse.builder().programInfo(program).member(member).applyAt(LocalDateTime.now())
				.build();

		try {
			useRepository.save(programUse);
		} catch (DataIntegrityViolationException e) {
			log.warn("중복 신청 시도 감지 - progNo={}, mid={}", progNo, mid);
			throw new IllegalStateException("이미 신청한 프로그램입니다.");
		}

	}

	// 관리자용 신청자 목록 조회
	@Override
	public List<ProgramUseDTO> getApplicantsByProgram(Long progNo) {
		List<ProgramUse> list = useRepository.findWithMemberByProgramInfo_ProgNo(progNo);
		return list.stream().map(this::toDTO).collect(Collectors.toList());
	}

	// 강의실 중복 여부 판단 메서드 (날짜+요일+시간 기준)
	@Override
	public boolean isRoomAvailable(ProgramRoomCheckDTO request) {
		List<LocalDate> classDates = generateClassDates(request.getStartDate(), request.getEndDate(),
				request.getDaysOfWeek());

		for (LocalDate date : classDates) {
			int dayOfWeek = date.getDayOfWeek().getValue();

			boolean conflict = infoRepository.existsByRoomAndDateTimeOverlap(request.getRoom(), date,
					request.getStartTime(), request.getEndTime(), dayOfWeek);

			if (conflict)
				return false;
		}
		return true;
	}

	// 모든 강의실이 해당 기간에 모두 겹치는지 확인
	@Override
	public boolean isAllRoomsOccupied(ProgramRoomCheckDTO request) {
		if (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty()) {
			return false;
		}

		List<String> rooms = List.of("문화교실1", "문화교실2", "문화교실3");
		long unavailableCount = rooms.stream().filter(room -> {
			request.setRoom(room);
			return !isRoomAvailable(request);
		}).count();

		return unavailableCount >= rooms.size();
	}

	// 전체 강의실 사용 가능 여부
	@Override
	public Map<String, Boolean> getRoomAvailabilityStatus(ProgramRoomCheckDTO request) {
		if (request.getStartDate().isAfter(request.getEndDate())) {
			throw new IllegalArgumentException("시작일은 종료일보다 이전이어야 합니다.");
		}

		List<String> rooms = List.of("문화교실1", "문화교실2", "문화교실3");
		Map<String, Boolean> result = new LinkedHashMap<>();

		for (String room : rooms) {
			request.setRoom(room); // 강의실 설정 후 검사
			boolean isAvailable = isRoomAvailable(request);
			result.put(room, isAvailable);
		}
		return result;
	}

	// 신청 대상자 여부 판단
	private boolean isEligible(String target, Member member) {
		if (target == null || target.isBlank() || "전체".equals(target)) {
			return true;
		}

		if (member.getBirthDate() == null) {
			return false;
		}

		int age = Period.between(member.getBirthDate(), LocalDate.now()).getYears();

		return switch (target) {
		case "어린이" -> age >= 0 && age <= 12;
		case "청소년" -> age >= 13 && age <= 18;
		case "성인" -> age >= 19;
		default -> false;
		};
	}

	// 이미 신청 했는지 여부 확인
	@Override
	public boolean isAlreadyApplied(Long progNo, String mid) {
		log.info("중복 확인 → progNo: {}, mid: {}", progNo, mid);
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
	// 회원 ID(mid)를 기준으로 해당 회원이 신청한 프로그램 목록을 페이지 형태로 조회
	@Override
	public Page<ProgramUseDTO> getUseListByMemberPaged(String mid, Pageable pageable) {
		Page<ProgramUse> result = useRepository.findByMember_Mid(mid, pageable);

		return result.map(this::toDTO);
	}

	// -------------------------- 배너 --------------------------
	// 배너 등록
	@Override
	public void registerBanner(ProgramBannerDTO dto, MultipartFile file) {
		LocalDate today = LocalDate.now();
		long currentBannerCount = bannerRepository.countValidBanners(today);
		if (currentBannerCount >= 6) {
			throw new IllegalStateException("배너는 최대 6개까지 등록할 수 있습니다.");
		}

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("배너 이미지를 첨부해주세요.");
		}
		if (!file.getContentType().startsWith("image")) {
			throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
		}

		// 중복 검사
		if (bannerRepository.existsByProgramInfo_ProgNo(dto.getProgramInfoId())) {
			throw new IllegalStateException("해당 프로그램에는 이미 배너가 등록되어 있습니다.");
		}

		List<Object> savedFiles = fileUtil.saveFiles(List.of(file), "program/banner");
		Map<String, String> fileMap = (Map<String, String>) savedFiles.get(0);

		String imageUrl = fileMap.get("filePath");
		String imageName = fileMap.get("originalName");

		ProgramInfo program = infoRepository.findById(dto.getProgramInfoId())
				.orElseThrow(() -> new IllegalArgumentException("해당 프로그램이 존재하지 않습니다."));

		ProgramBanner banner = new ProgramBanner();
		banner.setImageName(imageName);
		banner.setImageUrl(imageUrl);
		banner.setProgramInfo(program);

		bannerRepository.save(banner);
	}

	// 배너 리스트 조회
	@Override
	public List<ProgramBannerDTO> getAllBanners() {
		LocalDate today = LocalDate.now();
		List<ProgramBanner> result = bannerRepository.findValidBanners(today);

		return result.stream().map(banner -> {
			ProgramInfo info = banner.getProgramInfo();
			ProgramBannerDTO dto = new ProgramBannerDTO();
			dto.setBno(banner.getBno());
			dto.setImageName(banner.getImageName());
			dto.setImageUrl(banner.getImageUrl());
			dto.setProgramInfoId(info.getProgNo());

			// 썸네일 경로 생성 (s_ 접두사 방식)
			String imageUrl = banner.getImageUrl();
			if (imageUrl != null && imageUrl.contains("/")) {
				String fileName = Paths.get(imageUrl).getFileName().toString();
				String parent = Paths.get(imageUrl).getParent().toString();
				dto.setThumbnailPath(imageUrl);
			}
			// 프로그램 정보 추가
			dto.setProgName(info.getProgName());
			dto.setTarget(info.getTarget());
			dto.setStartDate(info.getStartDate());
			dto.setEndDate(info.getEndDate());
			dto.setStartTime(info.getStartTime());
			dto.setEndTime(info.getEndTime());
			dto.setDaysOfWeek(info.getDaysOfWeek());
			dto.setDayNames(convertToDayNames(info.getDaysOfWeek()));

			return dto;
		}).collect(Collectors.toList());
	}

	// 배너 삭제
	@Override
	public void deleteBanner(Long bno) {
		ProgramBanner banner = bannerRepository.findById(bno)
				.orElseThrow(() -> new IllegalArgumentException("해당 배너가 존재하지 않습니다."));

		String imageUrl = banner.getImageUrl();
		if (imageUrl != null) {
			String fileName = Paths.get(imageUrl).getFileName().toString();
			String parent = Paths.get(imageUrl).getParent().toString();
			String thumbnailPath = parent + "/s_" + fileName;

			fileUtil.deleteFiles(List.of(imageUrl, thumbnailPath));
		}

		bannerRepository.delete(banner);
	}

	// -------------------------- 공통 메서드 --------------------------

	// ProgramUse → ProgramUseDTO 변환 메서드
	private ProgramUseDTO toDTO(ProgramUse use) {
		ProgramInfo info = use.getProgramInfo();
		Member member = use.getMember();

		String status = info.getEndDate().isBefore(LocalDate.now()) ? "강의종료" : "신청완료";
		List<Integer> dayOfWeekIntList = info.getDaysOfWeek();

		String startTime = info.getStartTime() != null ? info.getStartTime().toString() : "";
		String endTime = info.getEndTime() != null ? info.getEndTime().toString() : "";

		return ProgramUseDTO.builder().progUseNo(use.getProgUseNo()).applyAt(use.getApplyAt()).progNo(info.getProgNo())
				.progName(info.getProgName()).teachName(info.getTeachName()).startDate(info.getStartDate())
				.endDate(info.getEndDate()).startTime(startTime).endTime(endTime).daysOfWeek(dayOfWeekIntList)
				.room(info.getRoom()).capacity(info.getCapacity())
				.current(useRepository.countByProgram(info.getProgNo())).status(status)
				.mid(member != null ? member.getMid() : null).name(member != null ? member.getName() : null)
				.email(member != null ? member.getEmail() : null).phone(member != null ? member.getPhone() : null)
				.build();
	}

	// 파일 처리 공통 메서드
	private void setFileInfo(ProgramInfo info, MultipartFile file) {
		log.info("setFileInfo called. file is null: {}, file is empty: {}", (file == null),
				(file != null && file.isEmpty()));

		// 파일이 넘어온 경우 (새 파일이 업로드 되었거나 기존 파일을 변경하는 경우)
		if (file != null && !file.isEmpty()) {
			String originalFilename = file.getOriginalFilename();

			if (originalFilename == null || originalFilename.isEmpty()) {
				throw new IllegalArgumentException("파일 이름이 존재하지 않습니다.");
			}

			// 파일 확장자 검사: .hwp 또는 .pdf 파일만 허용
			String lowerCaseFilename = originalFilename.toLowerCase();
			boolean isAllowedDocument = lowerCaseFilename.endsWith(".hwp") || lowerCaseFilename.endsWith(".pdf");

			if (!isAllowedDocument) { // .hwp 또는 .pdf 파일이 아닌 경우
				throw new IllegalArgumentException("hwp 또는 pdf 파일만 업로드 가능합니다.");
			}

			// 기존 파일 삭제 (있으면)
			String oldPath = info.getFilePath();
			if (oldPath != null && !oldPath.isEmpty()) {
				try {
					fileUtil.deleteFiles(List.of(oldPath));
					log.info("기존 파일 삭제 완료: {}", oldPath);
				} catch (RuntimeException e) {
					log.warn("기존 파일 삭제 실패: {}", oldPath, e);
					throw e;
				}
			}

			// 새 파일 저장
			List<Object> uploaded = fileUtil.saveFiles(List.of(file), "program");
			if (!uploaded.isEmpty()) {
				@SuppressWarnings("unchecked")
				Map<String, String> fileInfoMap = (Map<String, String>) uploaded.get(0);
				info.setOriginalName(fileInfoMap.get("originalName"));
				info.setFilePath(fileInfoMap.get("filePath"));
				log.info("New file saved. OriginalName: {}, FilePath: {}", fileInfoMap.get("originalName"),
						fileInfoMap.get("filePath"));
			}

		}
		// 파일이 전달되지 않은 경우 (file == null || file.isEmpty()) -> 기존 파일 유지
		else {
			log.info("파일이 전달되지 않음 → 기존 파일 유지");
		}
	}
}