package com.dglib.service.place;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.place.PlaceDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.place.Place;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.place.PlaceRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class PlaceServiceImpl implements PlaceService{
	
	private final PlaceRepository placeRepository;
	private final ModelMapper modelMapper;
	private final MemberRepository memberRepository;
	
	// 등록
	@Override
	public Long registerPlace(PlaceDTO dto) {
		
		// 시간 겹치는 다른 시설 예약 방지
		validateDuplicateReservation(dto);
		
		// 회원 존재 여부 확인
		Member member = memberRepository.findById(dto.getMemberMid())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		// 이용일자: 오늘 이전 날짜 불가
		if(dto.getUseDate().isBefore(LocalDateTime.now().toLocalDate())) {
			throw new IllegalArgumentException("지난 날짜는 선택이 불가능합니다.");
		}
		
		// 이용시간: 1~3시간만 허용
		int duration = dto.getDurationTime();
		if(duration < 1 || duration > 3) {
			throw new IllegalArgumentException("이용 시간은 최대 3시간까지 가능합니다.");
		}
		
		// 참가자 수 유효성 검사
		if(dto.getParticipants() == null || dto.getParticipants().isBlank()) {
			throw new IllegalArgumentException("참가자ID를 입력해 주세요.");
		}
		
		String[] participantsArray = dto.getParticipants().split(",");
		if(participantsArray.length != dto.getPeople()) {
			throw new IllegalArgumentException("입력한 인원 수와 참가자 수가 일치하지 않습니다.");
		}
		
		// 해당 시간, 공간에 이미 신청된 내역이 있는지 확인
		boolean alreadyExists = placeRepository.existsBySchedule(
				dto.getRoom(), dto.getUseDate(), dto.getStartTime());
		if(alreadyExists) {
			throw new IllegalArgumentException("선택하신 해당 공간의 시간대는 이미 예약되어 있습니다.");
		}
		
		// 중복 예약 검사 (1일 1시설 초과 예약 금지)
		boolean duplicateReservation = placeRepository.existsByMember_MidAndRoomAndUseDate(
			dto.getMemberMid(), dto.getRoom(), dto.getUseDate()
		);
		if (duplicateReservation) {
			throw new IllegalArgumentException("하루에 동일한 시설을 중복 예약할 수 없습니다.");
		}

		
		Place place = Place.builder()
				.member(member)
				.room(dto.getRoom())
				.useDate(dto.getUseDate())
				.startTime(dto.getStartTime())
				.durationTime(dto.getDurationTime())
				.people(dto.getPeople())
				.participants(dto.getParticipants())
				.purpose(dto.getPurpose())
				.appliedAt(LocalDateTime.now())
				.build();
		
		return placeRepository.save(place).getPno();
	}
	
	// 다른 시설 예약 시 시간 겹치면 예약 불가
	private void validateDuplicateReservation(PlaceDTO dto) {
		LocalDate useDate = dto.getUseDate();
		LocalTime startTime = dto.getStartTime();
		LocalTime endTime = startTime.plusHours(dto.getDurationTime());
		
		List<Place> reservations = placeRepository.findByMember_MidAndUseDate(dto.getMemberMid(),useDate);
		
		boolean hasOverlap = reservations.stream().anyMatch(p -> {        //p는 reservation 리스트 안의 각 Place 개체 하나임
			LocalTime existingStart = p.getStartTime();
			LocalTime existingEnd = existingStart.plusHours(p.getDurationTime());
			return startTime.isBefore(existingEnd) && endTime.isAfter(existingStart);
		});
		
		if(hasOverlap) {
			throw new IllegalStateException("이미 해당 시간대에 다른 시설을 예약하셨습니다.");
		}
	}
	
	// 조회
	@Override
	public PlaceDTO get(Long pno) {
	    Place place = placeRepository.findById(pno)
	        .orElseThrow(() -> new IllegalArgumentException("신청 내역이 존재하지 않습니다."));

	    PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
	    dto.setMemberMid(place.getMember().getMid());
	    return dto;
	}

	
	// 삭제
	@Override
	public void delete(Long pno) {
		Place place = placeRepository.findById(pno)
			.orElseThrow(() -> new IllegalArgumentException("해당 신청 내역이 존재하지 않습니다."));

		// 이용일이 지난 예약은 삭제 불가
		if (place.getUseDate().isBefore(LocalDateTime.now().toLocalDate())) {
			throw new IllegalStateException("이미 지난 예약은 취소할 수 없습니다.");
		}

		placeRepository.deleteById(pno);
	}
	
	// 회원별 신청 목록 조회
	@Override
	public List<PlaceDTO> getListByMember(String mid){
		List<Place> places = placeRepository.findByMember_Mid(mid);
		return places.stream()
				.map(place -> {
					PlaceDTO dto = modelMapper.map(place, PlaceDTO.class);
					dto.setMemberMid(place.getMember().getMid());
					return dto;
				})
				.collect(Collectors.toList());
	}
	
	
}
