package com.dglib.service.days;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.days.HolidayDTO;
import com.dglib.entity.days.ClosedDay;
import com.dglib.repository.days.ClosedDayRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class ClosedDayServiceImpl implements ClosedDayService {

	private final ClosedDayRepository closedDayRepository;
	private final HolidayApiService holidayApiService;
	private final ModelMapper modelMapper;
	private static final Logger LOGGER = LoggerFactory.getLogger(ClosedDayServiceImpl.class);

	// 수동 등록(자체휴관일)
	@Override
	public LocalDate registerClosedDay(ClosedDayDTO dto) {

		if (closedDayRepository.existsById(dto.getClosedDate())) {
			throw new IllegalArgumentException("이미 등록된 휴관일입니다.");
		}

		ClosedDay entity = modelMapper.map(dto, ClosedDay.class);
		closedDayRepository.save(entity);
		return entity.getClosedDate(); // 날짜를 Long 형태로 반환
	}

	// 단일 조회
	@Override
	public ClosedDayDTO get(LocalDate date) {
		ClosedDay entity = closedDayRepository.findById(date)
				.orElseThrow(() -> new IllegalArgumentException("해당 날짜의 휴관일이 없습니다."));

		return modelMapper.map(entity, ClosedDayDTO.class);
	}

	// 챗봇용 단일 조회
	@Override
	public ClosedDayDTO getByChat(LocalDate date) {
		ClosedDay entity = closedDayRepository.findById(date).orElse(ClosedDay.builder().isClosed(false).build());

		return modelMapper.map(entity, ClosedDayDTO.class);
	}

	// 주간 조회
	@Override
	public List<ClosedDayDTO> getWeeklyList(LocalDate start, LocalDate end) {

		List<ClosedDay> list = closedDayRepository.findByClosedDateBetween(start, end).stream()
				.sorted(Comparator.comparing(ClosedDay::getClosedDate)).collect(Collectors.toList());

		return list.stream().map(day -> modelMapper.map(day, ClosedDayDTO.class)).collect(Collectors.toList());
	}

	// 월별 조회
	@Override
	public List<ClosedDayDTO> getMonthlyList(int year, int month) {
		LocalDate start = LocalDate.of(year, month, 1);
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

		List<ClosedDay> list = closedDayRepository.findByClosedDateBetween(start, end).stream()
				.sorted(Comparator.comparing(ClosedDay::getClosedDate)).collect(Collectors.toList());

		return list.stream().map(day -> {
			ClosedDayDTO dto = modelMapper.map(day, ClosedDayDTO.class);
			dto.setType(day.getIsClosed() ? "공휴일" : "기념일");
			return dto;
		}).collect(Collectors.toList());
	}

	// 수정
	@Override
	public void update(String originalDate, ClosedDayDTO dto) {
		LocalDate targetDate = LocalDate.parse(originalDate); // 기존 날짜로 조회
		ClosedDay existing = closedDayRepository.findById(targetDate)
				.orElseThrow(() -> new IllegalArgumentException("해당 날짜의 일정이 없습니다."));

		// 날짜가 변경된 경우 삭제 후 재등록 처리 또는 업데이트 처리
		if (!dto.getClosedDate().equals(targetDate)) {
			closedDayRepository.delete(existing); // 기존 삭제
			ClosedDay newEntity = modelMapper.map(dto, ClosedDay.class);
			closedDayRepository.save(newEntity); // 새로 등록
		} else {
			existing.setReason(dto.getReason());
			existing.setIsClosed(dto.getIsClosed());
			closedDayRepository.save(existing);
		}
	}

	// 삭제
	@Override
	public void delete(LocalDate date) {
		ClosedDay day = closedDayRepository.findById(date)
				.orElseThrow(() -> new IllegalArgumentException("삭제할 휴관일이 존재하지 않습니다."));

		closedDayRepository.delete(day);
	}

	// 전체 삭제(테스트용)
//	@Override
//	public void deleteAllClosedDays() {
//		closedDayRepository.deleteAll();
//	}

	// -------------------- 자동 등록 메서드 --------------------
	// 월요일 등록
	@Override
	public void registerMondays(int year) {
		LocalDate date = LocalDate.of(year, 1, 1);
		List<LocalDate> mondays = new ArrayList<>();

		while (date.getYear() == year) {
			if (date.getDayOfWeek() == DayOfWeek.MONDAY) {
				mondays.add(date);
			}
			date = date.plusDays(1);
		}

		List<LocalDate> existingDates = closedDayRepository.findExistingDates(mondays);
		List<ClosedDay> newMondays = mondays.stream().filter(d -> !existingDates.contains(d))
				.map(d -> ClosedDay.builder().closedDate(d).reason("정기휴관일").isClosed(true).build())
				.collect(Collectors.toList());

		closedDayRepository.saveAll(newMondays);
	}

	// 공휴일 등록 (설날, 추석은 당일만)
	@Override
	public void registerHolidays(int year) {
		List<ClosedDay> newClosedDays = new ArrayList<>();

		for (int month = 1; month <= 12; month++) {
			List<HolidayDTO> holidays = holidayApiService.fetch(year, month);

			// 1. 설날 / 추석 → 그룹핑해서 가운데 날짜만 저장
			holidays.stream().filter(h -> h.getName().contains("설날") || h.getName().contains("추석"))
					.collect(Collectors.groupingBy(HolidayDTO::getName)).values().forEach(group -> {
						group.sort(Comparator.comparing(HolidayDTO::getDate));
						HolidayDTO middle = group.get(group.size() / 2);
						newClosedDays.add(ClosedDay.builder().closedDate(middle.getDate()).reason(middle.getName())
								.isClosed(true).build());
					});

			// 2. 그 외 공휴일 추가
			holidays.stream().filter(dto -> !(dto.getName().contains("설날") || dto.getName().contains("추석")))
					.forEach(dto -> newClosedDays.add(ClosedDay.builder().closedDate(dto.getDate())
							.reason(dto.getName()).isClosed(true).build()));
		}

		// 3. 중복 필터링
		List<LocalDate> allDates = newClosedDays.stream().map(ClosedDay::getClosedDate).toList();

		List<LocalDate> existingDates = closedDayRepository.findExistingDates(allDates);

		List<ClosedDay> filtered = newClosedDays.stream().filter(day -> !existingDates.contains(day.getClosedDate()))
				.toList();

		// 4. 일괄 저장
		closedDayRepository.saveAll(filtered);
	}

	// 개관일 등록 (매년 7월 8일)
	@Override
	public void registerLibraryAnniversary(int year) {
		LocalDate date = LocalDate.of(year, 7, 8);

		List<LocalDate> existing = closedDayRepository.findExistingDates(List.of(date));
		if (existing.contains(date))
			return;

		ClosedDay day = ClosedDay.builder().closedDate(date).reason("도서관 개관일").isClosed(true).build();

		closedDayRepository.save(day);
	}

	// 한해 자동 등록
	@Override
	public void registerAllAutoEventsForYear(int year) {
		try {
			registerMondays(year);
			registerHolidays(year);
			registerLibraryAnniversary(year);
		} catch (Exception e) {
			LOGGER.error("자동 등록 중 예외 발생: {}", e.getMessage());
		}
	}

}
