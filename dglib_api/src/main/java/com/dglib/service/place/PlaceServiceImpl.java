package com.dglib.service.place;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.place.PlaceDTO;
import com.dglib.dto.place.PlaceSearchConditionDTO;
import com.dglib.dto.place.ReservationStatusDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.place.Place;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.place.PlaceRepository;
import com.dglib.service.days.ClosedDayService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class PlaceServiceImpl implements PlaceService {

	private final PlaceRepository placeRepository;
	private final ModelMapper modelMapper;
	private final MemberRepository memberRepository;
	private final ClosedDayService closedDayService;

	private String option;
	private String query;

	private static final int MIN_DURATION_HOURS = 1;
	private static final int MAX_DURATION_HOURS = 3;
	private static final int CLUB_ROOM_MIN_PEOPLE = 4;
	private static final int CLUB_ROOM_MAX_PEOPLE = 8;
	private static final int SEMINAR_ROOM_MIN_PEOPLE = 6;
	private static final int SEMINAR_ROOM_MAX_PEOPLE = 12;
	private static final int MAX_USER_RESERVATION_MINUTES_PER_DAY = 180; // 3시간 * 60분
	private static final int MAX_ROOM_RESERVATION_MINUTES_PER_DAY = 480; // 8시간 * 60분

	// 관리자 조회
	@Override
	public Page<PlaceDTO> getListByAdmin(PlaceSearchConditionDTO cond) {
		Pageable pageable = PageRequest.of(cond.getPage(), cond.getSize(),
				Sort.by(Sort.Direction.fromString(cond.getOrderBy()), cond.getSortBy()));

		if (cond.getOption() != null && cond.getQuery() != null && !cond.getQuery().isBlank()) {
			switch (cond.getOption()) {
			case "mid" -> cond.setMid(cond.getQuery());
			case "name" -> cond.setName(cond.getQuery());
			case "room" -> cond.setRoom(cond.getQuery());
			}
		}

		Page<Place> result = placeRepository.findAll((root, query, cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (cond.getStartDate() != null && !cond.getStartDate().isEmpty()) {
				predicates.add(cb.greaterThanOrEqualTo(root.get("appliedAt"),
						LocalDate.parse(cond.getStartDate()).atStartOfDay()));
			}
			if (cond.getEndDate() != null && !cond.getEndDate().isEmpty()) {
				predicates.add(cb.lessThanOrEqualTo(root.get("appliedAt"),
						LocalDate.parse(cond.getEndDate()).atTime(23, 59, 59)));
			}
			if (cond.getMid() != null && !cond.getMid().isEmpty()) {
				predicates.add(cb.equal(root.get("member").get("mid"), cond.getMid()));
			}
			if (cond.getName() != null && !cond.getName().isEmpty()) {
				predicates.add(cb.like(root.get("member").get("name"), "%" + cond.getName() + "%"));
			}
			if (cond.getRoom() != null && !cond.getRoom().isEmpty()) {
				predicates.add(cb.equal(root.get("room"), cond.getRoom()));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		}, pageable);

		return result.map(this::convertToDTO);
	}

	private PlaceDTO convertToDTO(Place entity) {
		return PlaceDTO.builder().pno(entity.getPno()).memberMid(entity.getMember().getMid())
				.memberName(entity.getMember().getName()).appliedAt(entity.getAppliedAt()).useDate(entity.getUseDate())
				.startTime(entity.getStartTime()).durationTime(entity.getDurationTime()).room(entity.getRoom())
				.people(entity.getPeople()).participants(entity.getParticipants()).purpose(entity.getPurpose()).build();
	}

	// 예약 등록
	@Override
	public Long registerPlace(PlaceDTO dto) {
		validateDuplicateReservation(dto); // 시간 겹침 검사

		Member member = memberRepository.findById(dto.getMemberMid())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

		if (member.getState() == MemberState.PUNISH) {
			throw new IllegalStateException("회원이 정지 상태로 인해 시설을 예약할 수 없습니다.");
		}
		if (member.getState() == MemberState.LEAVE) {
			throw new IllegalStateException("탈퇴계정은 시설을 예약할 수 없습니다.");
		}

		if (dto.getUseDate().isBefore(LocalDate.now())) {
			throw new IllegalArgumentException("지난 날짜는 선택이 불가능합니다.");
		}

		if (dto.getUseDate().isEqual(LocalDate.now())) {
			if (dto.getStartTime().isBefore(LocalTime.now())) {
				throw new IllegalArgumentException("현재 시간 이전의 시간은 예약할 수 없습니다.");
			}
		}

		if (dto.getDurationTime() < MIN_DURATION_HOURS || dto.getDurationTime() > MAX_DURATION_HOURS) {
			throw new IllegalArgumentException(
					"이용 시간은 " + MIN_DURATION_HOURS + "~" + MAX_DURATION_HOURS + "시간 사이만 가능합니다.");
		}

		if (dto.getParticipants() == null || dto.getParticipants().isBlank()) {
			throw new IllegalArgumentException("참가자ID를 입력해 주세요.");
		}

		String[] participantsArray = dto.getParticipants().split(",");
		if (participantsArray.length != dto.getPeople()) {
			throw new IllegalArgumentException("입력한 인원 수와 참가자 수가 일치하지 않습니다.");
		}

		// 참여자 유효성 검사 최적화
		// 회원 중복 검사
		List<String> participantIds = Arrays.stream(participantsArray).map(String::trim).collect(Collectors.toList());

		Map<String, Long> idCounts = participantIds.stream()
				.collect(Collectors.groupingBy(id -> id, Collectors.counting()));

		List<String> duplicateIds = idCounts.entrySet().stream().filter(e -> e.getValue() > 1).map(Map.Entry::getKey)
				.toList();

		if (!duplicateIds.isEmpty()) {
			throw new IllegalArgumentException("참가자 ID는 중복될 수 없습니다. 중복 ID: " + String.join(", ", duplicateIds));
		}

		// 회원 존재 여부 검사
		Set<String> uniqueParticipantIds = new HashSet<>(participantIds);

		List<Member> existingParticipants = memberRepository.findAllById(uniqueParticipantIds);

		if (existingParticipants.size() != uniqueParticipantIds.size()) {
			List<String> foundIds = existingParticipants.stream().map(Member::getMid).toList();

			String missingId = uniqueParticipantIds.stream().filter(id -> !foundIds.contains(id)).findFirst()
					.orElse("Unknown");

			throw new IllegalArgumentException("참가자 ID '" + missingId + "' 는 존재하지 않는 회원입니다.");
		}

		// 정지, 탈퇴 회원 존재 여부 검사
		boolean hasInvalidState = existingParticipants.stream()
				.anyMatch(m -> m.getState() == MemberState.PUNISH || m.getState() == MemberState.LEAVE);

		if (hasInvalidState) {
			throw new IllegalArgumentException("참가자 명단에 이용이 불가한 회원이 있습니다.");
		}

		// 동아리실 인원 제한
		if (dto.getRoom().equals("동아리실")) {
			if (dto.getPeople() < CLUB_ROOM_MIN_PEOPLE || dto.getPeople() > CLUB_ROOM_MAX_PEOPLE) {
				throw new IllegalArgumentException(
						"동아리실은 " + CLUB_ROOM_MIN_PEOPLE + "인 이상 " + CLUB_ROOM_MAX_PEOPLE + "인 이하만 예약할 수 있습니다.");
			}
		}

		// 세미나실 인원 제한
		if (dto.getRoom().equals("세미나실")) {
			if (dto.getPeople() < SEMINAR_ROOM_MIN_PEOPLE || dto.getPeople() > SEMINAR_ROOM_MAX_PEOPLE) {
				throw new IllegalArgumentException(
						"세미나실은 " + SEMINAR_ROOM_MIN_PEOPLE + "인 이상 " + SEMINAR_ROOM_MAX_PEOPLE + "인 이하만 예약할 수 있습니다.");
			}
		}

		// 동일 시간대 예약 여부
		boolean alreadyExists = placeRepository.existsBySchedule(dto.getRoom(), dto.getUseDate(), dto.getStartTime());
		if (alreadyExists) {
			throw new IllegalArgumentException("선택하신 해당 공간의 시간대는 이미 예약되어 있습니다.");
		}

		// 동일 시설 중복 예약 여부
		boolean duplicateReservation = placeRepository.existsByMember_MidAndRoomAndUseDate(dto.getMemberMid(),
				dto.getRoom(), dto.getUseDate());
		if (duplicateReservation) {
			throw new IllegalArgumentException("하루에 동일한 시설을 중복 예약할 수 없습니다.");
		}

		// 하루 3시간 제한 검사
		int userReservedMinutes = placeRepository.findByMember_MidAndUseDate(dto.getMemberMid(), dto.getUseDate())
				.stream().mapToInt(p -> p.getDurationTime() * 60).sum();
		if (userReservedMinutes + dto.getDurationTime() * 60 > MAX_USER_RESERVATION_MINUTES_PER_DAY) {
			throw new IllegalArgumentException("더 이상 예약하실 수 없습니다.");
		}

		// 시설 하루 8시간 제한 검사
		int roomReservedMinutes = placeRepository.findByRoomAndUseDate(dto.getRoom(), dto.getUseDate()).stream()
				.mapToInt(p -> p.getDurationTime() * 60).sum();
		if (roomReservedMinutes + dto.getDurationTime() * 60 > MAX_ROOM_RESERVATION_MINUTES_PER_DAY) {
			throw new IllegalArgumentException("더 이상 예약하실 수 없습니다.");
		}

		// 최종 저장
		Place place = Place.builder().member(member).room(dto.getRoom()).useDate(dto.getUseDate())
				.startTime(dto.getStartTime()).durationTime(dto.getDurationTime()).people(dto.getPeople())
				.participants(dto.getParticipants()).purpose(dto.getPurpose()).appliedAt(LocalDateTime.now()).build();

		return placeRepository.save(place).getPno();
	}

	// 중복 예약 검사 (다른 시설과 시간 겹치지 않게)
	private void validateDuplicateReservation(PlaceDTO dto) {
		LocalDate useDate = dto.getUseDate();
		LocalTime startTime = dto.getStartTime();
		LocalTime endTime = startTime.plusHours(dto.getDurationTime());

		List<Place> reservations = placeRepository.findByMember_MidAndUseDate(dto.getMemberMid(), useDate);

		boolean hasOverlap = reservations.stream().anyMatch(p -> {
			LocalTime existingStart = p.getStartTime();
			LocalTime existingEnd = existingStart.plusHours(p.getDurationTime());
			return startTime.isBefore(existingEnd) && endTime.isAfter(existingStart);
		});

		if (hasOverlap) {
			throw new IllegalStateException("이미 해당 시간대에 다른 시설을 예약하셨습니다.");
		}
	}

	// 단건 조회
	@Override
	public PlaceDTO get(Long pno) {
		Place place = placeRepository.findById(pno)
				.orElseThrow(() -> new IllegalArgumentException("신청 내역이 존재하지 않습니다."));

		PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
		dto.setMemberMid(place.getMember().getMid());
		return dto;
	}

	// 예약 삭제
	@Override
	public void delete(Long pno) {
		Place place = placeRepository.findById(pno)
				.orElseThrow(() -> new IllegalArgumentException("해당 신청 내역이 존재하지 않습니다."));

		// 회원은 이용일이 지난 예약은 취소 불가
		if (place.getUseDate().isBefore(LocalDate.now())) {
			throw new IllegalStateException("이미 지난 예약은 취소할 수 없습니다.");
		}

		placeRepository.deleteById(pno);
	}

	// 관리자 예약 삭제
	@Override
	public void cancelByAdmin(Long pno) {
		Place place = placeRepository.findById(pno)
				.orElseThrow(() -> new IllegalArgumentException("예약 정보가 존재하지 않습니다."));

		// 과거 예약도 삭제 가능
		placeRepository.delete(place);
	}

	// 회원별 신청 내역(list)
	@Override
	public List<PlaceDTO> getListByMember(String mid) {
		return placeRepository.findByMember_Mid(mid).stream().map(place -> {
			PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
			dto.setMemberMid(place.getMember().getMid());
			return dto;
		}).collect(Collectors.toList());
	}

	// 회원별 신청 내역(page)
	@Override
	public Page<PlaceDTO> getListByMemberPaged(String mid, Pageable pageable) {
		Page<Place> result = placeRepository.findByMember_Mid(mid, pageable);

		return result.map(place -> {
			PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
			dto.setMemberMid(place.getMember().getMid());
			return dto;
		});
	}

	// 월별 예약 현황 (달력 API)
	@Override
	public List<ReservationStatusDTO> getMonthlyReservationStatus(int year, int month) {
		List<Object[]> usageTimeList = placeRepository.sumReservedMinutesByDateAndRoom(year, month);
		List<ClosedDayDTO> closedList = closedDayService.getMonthlyList(year, month);

		Map<LocalDate, ReservationStatusDTO> resultMap = new HashMap<>();

		for (ClosedDayDTO cd : closedList) {
			resultMap.put(cd.getClosedDate(), new ReservationStatusDTO(cd.getClosedDate(), true, cd.getReason(), null));
		}

		for (Object[] row : usageTimeList) {
			LocalDate date = (LocalDate) row[0];
			String room = (String) row[1];
			Long totalMinutes = (Long) row[2];

			if (resultMap.containsKey(date) && resultMap.get(date).isClosed())
				continue;

			ReservationStatusDTO dto = resultMap.computeIfAbsent(date,
					d -> new ReservationStatusDTO(d, false, null, new HashMap<>()));

			if (dto.getStatus() == null)
				dto.setStatus(new HashMap<>());

			dto.getStatus().put(room, totalMinutes >= MAX_ROOM_RESERVATION_MINUTES_PER_DAY ? "full" : "available");
		}

		return resultMap.values().stream().sorted(Comparator.comparing(ReservationStatusDTO::getDate))
				.collect(Collectors.toList());
	}

	// 조회 전용 유틸
	@Override
	public boolean isTimeSlotReserved(String room, LocalDate date, LocalTime time) {
		return placeRepository.existsBySchedule(room, date, time);
	}

	@Override
	public boolean isDuplicateReservation(String mid, String room, LocalDate date) {
		return placeRepository.existsByMember_MidAndRoomAndUseDate(mid, room, date);
	}

	@Override
	public List<PlaceDTO> getReservedTimes(String room, LocalDate date) {
		return placeRepository.findByRoomAndUseDate(room, date).stream().map(p -> {
			PlaceDTO dto = new PlaceDTO();
			dto.setStartTime(p.getStartTime());
			dto.setDurationTime(p.getDurationTime());
			return dto;
		}).toList();
	}
}