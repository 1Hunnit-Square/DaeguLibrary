package com.dglib.service.days;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.dto.days.HolidayDTO;
import com.dglib.entity.days.ClosedDay;
import com.dglib.repository.days.ClosedDayRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class ClosedDayServiceImpl implements ClosedDayService {
	
	private final ClosedDayRepository closedDayRepository;
    private final HolidayApiService holidayApiService;
    private final ModelMapper modelMapper;
	
    // 수동 등록(자체휴관일)
	@Override
	public LocalDate registerClosedDay(ClosedDayDTO dto) {
		
		if(closedDayRepository.existsById(dto.getClosedDate())) {
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
	
	// 월별 조회
	@Override
	public List<ClosedDayDTO> getMonthlyList(int year, int month) {
	    List<ClosedDay> list = closedDayRepository.findAll().stream()
	            .filter(day -> day.getClosedDate().getYear() == year && day.getClosedDate().getMonthValue() == month)
	            .sorted(Comparator.comparing(ClosedDay::getClosedDate)) //휴관일 리스트를 날짜순으로 정렬
	            .collect(Collectors.toList());

	    return list.stream()
	            .map(day -> modelMapper.map(day, ClosedDayDTO.class))
	            .collect(Collectors.toList());
	}
	
	
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
	    if (!closedDayRepository.existsById(date)) {
	        throw new IllegalArgumentException("삭제할 휴관일이 존재하지 않습니다.");
	    }

	    closedDayRepository.deleteById(date);
	}

	
	// 자동 등록 메서드
	
	// 월요일 등록
	@Override
	public void registerMondays(int year) {
		LocalDate date = LocalDate.of(year, 1, 1);
		
		while (date.getYear() == year) {
			if(date.getDayOfWeek() == DayOfWeek.MONDAY) {
				if(!closedDayRepository.existsById(date)) {
					closedDayRepository.save(ClosedDay.builder()
							.closedDate(date)
							.reason("정기휴관일")
							.isClosed(true)
							.build());
				}
			}
			date = date.plusDays(1);
		}
	}
	
	// 공휴일 등록 (설날, 추석은 당일만)
	@Override
	public void registerHolidays(int year) {
	    for (int month = 1; month <= 12; month++) {
	        List<HolidayDTO> holidays = holidayApiService.fetch(year, month);

	        // 설날/추석 처리 - 이름 기준 그룹핑 후 가운데 날짜만 등록
	        holidays.stream()
	            .filter(h -> h.getName().contains("설날") || h.getName().contains("추석"))
	            .collect(Collectors.groupingBy(HolidayDTO::getName))
	            .values().forEach(group -> {
	                group.sort(Comparator.comparing(HolidayDTO::getDate));
	                HolidayDTO middle = group.get(group.size() / 2);
	                LocalDate date = middle.getDate();
	                if (!closedDayRepository.existsById(date)) {
	                    closedDayRepository.save(ClosedDay.builder()
	                        .closedDate(date)
	                        .reason(middle.getName())  // "설날" 또는 "추석"
	                        .isClosed(true)
	                        .build());
	                }
	            });

	        // 그 외 공휴일 등록
	        for (HolidayDTO dto : holidays) {
	            String name = dto.getName();
	            if (name.contains("설날") || name.contains("추석")) continue; // 이미 처리됨
	            LocalDate date = dto.getDate();
	            if (!closedDayRepository.existsById(date)) {
	                closedDayRepository.save(ClosedDay.builder()
	                    .closedDate(date)
	                    .reason(name)
	                    .isClosed(true)
	                    .build());
	            }
	        }
	    }
	}

	// 개관일 등록 (매년 7월 8일)
	@Override
	public void registerLibraryAnniversary(int year) {
	    LocalDate date = LocalDate.of(year, 7, 8);
	    if (!closedDayRepository.existsById(date)) {
	        closedDayRepository.save(ClosedDay.builder()
	            .closedDate(date)
	            .reason("도서관 개관일")
	            .isClosed(true)
	            .build());
	    }
	}
	
	@Override
	public void registerAllAutoEventsForYear(int year) {
	    try {
	        registerMondays(year);
	        registerHolidays(year);
	        registerLibraryAnniversary(year);
	    } catch (Exception e) {
	        log.warn("자동 등록 중 예외 발생: {}", e.getMessage());
	        // 예외 무시하고 정상 응답만 리턴
	    }
	}

	
	
}
