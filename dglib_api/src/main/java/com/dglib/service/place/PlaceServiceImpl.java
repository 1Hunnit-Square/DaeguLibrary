package com.dglib.service.place;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.place.PlaceDTO;
import com.dglib.dto.place.ReservationStatusDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.place.Place;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.place.PlaceRepository;
import com.dglib.service.days.ClosedDayService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class PlaceServiceImpl implements PlaceService {

	private final PlaceRepository placeRepository;
	private final ModelMapper modelMapper;
	private final MemberRepository memberRepository;
	private final ClosedDayService closedDayService;

	// 예약 등록
	@Override
	public Long registerPlace(PlaceDTO dto) {
		validateDuplicateReservation(dto); // 시간 겹침 검사

		Member member = memberRepository.findById(dto.getMemberMid())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

		if (dto.getUseDate().isBefore(LocalDate.now())) {
			throw new IllegalArgumentException("지난 날짜는 선택이 불가능합니다.");
		}

		if (dto.getDurationTime() < 1 || dto.getDurationTime() > 3) {
			throw new IllegalArgumentException("이용 시간은 1~3시간 사이만 가능합니다.");
		}

		if (dto.getParticipants() == null || dto.getParticipants().isBlank()) {
			throw new IllegalArgumentException("참가자ID를 입력해 주세요.");
		}

		String[] participantsArray = dto.getParticipants().split(",");
		if (participantsArray.length != dto.getPeople()) {
			throw new IllegalArgumentException("입력한 인원 수와 참가자 수가 일치하지 않습니다.");
		}

		if (dto.getRoom().equals("동아리실")) {
			if (dto.getPeople() < 4 || dto.getPeople() > 8) {
				throw new IllegalArgumentException("동아리실은 4인 이상 8인 이하만 예약할 수 있습니다.");
			}
		}

		if (dto.getRoom().equals("세미나실")) {
			if (dto.getPeople() < 6 || dto.getPeople() > 12) {
				throw new IllegalArgumentException("세미나실은 6인 이상 12인 이하만 예약할 수 있습니다.");
			}
		}

		boolean alreadyExists = placeRepository.existsBySchedule(dto.getRoom(), dto.getUseDate(), dto.getStartTime());
		if (alreadyExists) {
			throw new IllegalArgumentException("선택하신 해당 공간의 시간대는 이미 예약되어 있습니다.");
		}

		boolean duplicateReservation = placeRepository.existsByMember_MidAndRoomAndUseDate(dto.getMemberMid(),
				dto.getRoom(), dto.getUseDate());
		if (duplicateReservation) {
			throw new IllegalArgumentException("하루에 동일한 시설을 중복 예약할 수 없습니다.");
		}

		// 하루 3시간 제한 검사
		int userReservedMinutes = placeRepository.findByMember_MidAndUseDate(dto.getMemberMid(), dto.getUseDate())
				.stream().mapToInt(p -> p.getDurationTime() * 60).sum();
		if (userReservedMinutes + dto.getDurationTime() * 60 > 180) {
			throw new IllegalArgumentException("하루 예약 가능 시간(3시간)을 초과할 수 없습니다.");
		}

		// 시설 하루 8시간 제한 검사
		int roomReservedMinutes = placeRepository.findByRoomAndUseDate(dto.getRoom(), dto.getUseDate()).stream()
				.mapToInt(p -> p.getDurationTime() * 60).sum();
		if (roomReservedMinutes + dto.getDurationTime() * 60 > 480) {
			throw new IllegalArgumentException("더 이상 예약할 수 없습니다 (시설 총 8시간 초과).");
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

		if (place.getUseDate().isBefore(LocalDate.now())) {
			throw new IllegalStateException("이미 지난 예약은 취소할 수 없습니다.");
		}

		placeRepository.deleteById(pno);
	}

	// 회원별 신청 내역
	@Override
	public List<PlaceDTO> getListByMember(String mid) {
		return placeRepository.findByMember_Mid(mid).stream().map(place -> {
			PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
			dto.setMemberMid(place.getMember().getMid());
			dto.setEndTime(place.getStartTime().plusHours(place.getDurationTime()));
			return dto;
		}).collect(Collectors.toList());
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

			dto.getStatus().put(room, totalMinutes >= 480 ? "full" : "available");
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
			dto.setEndTime(p.getStartTime().plusHours(p.getDurationTime()));
			return dto;
		}).toList();
	}
}
