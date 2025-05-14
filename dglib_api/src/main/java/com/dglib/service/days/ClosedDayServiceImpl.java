package com.dglib.service.days;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.ClosedDayDTO;
import com.dglib.entity.days.ClosedDay;
import com.dglib.repository.days.ClosedDayRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class ClosedDayServiceImpl implements ClosedDayService{
	
	private final ClosedDayRepository closedDayRepository;
	private final ModelMapper modelMapper;
	
	@Override
	public Long registerClosedDay(ClosedDayDTO dto) {
		ClosedDay entity = modelMapper.map(dto, ClosedDay.class);
		return closedDayRepository.save(entity).getClosedId();
	}
	
	@Override
    public ClosedDayDTO get(Long closedId) {
        ClosedDay entity = closedDayRepository.findById(closedId)
                .orElseThrow(() -> new IllegalArgumentException("해당 휴관일이 존재하지 않습니다."));
        return modelMapper.map(entity, ClosedDayDTO.class);
    }
	
	@Override
	public List<ClosedDayDTO> getMonthlyList(int year, int month){
		LocalDate start = LocalDate.of(year, month, 1);
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		
		List<ClosedDay> result = closedDayRepository.findByClosedDateBetween(start, end);
		return result.stream()
				.sorted(Comparator.comparing(ClosedDay::getClosedDate))
				.map(entity -> modelMapper.map(entity, ClosedDayDTO.class))
				.collect(Collectors.toList());
	}
	
	@Override
	public void delete(Long closedId) {
		closedDayRepository.deleteById(closedId);
	}
	
	// 특정 달의 월요일 등록
	@Override
	public List<Long> registerMondays(int year, int month){
		LocalDate date = LocalDate.of(year, month, 1);
		LocalDate end = date.withDayOfMonth(date.lengthOfMonth());
		
		List<Long> registeredIds = new ArrayList<>();
		while (!date.isAfter(end)) {
			if(date.getDayOfWeek() == DayOfWeek.MONDAY) {
				boolean exists = closedDayRepository
						.findByClosedDateBetween(date, date).stream().findAny().isPresent();
				if(!exists) {
					ClosedDay monday = ClosedDay.builder()
							.closedDate(date)
							.isClosed(true)
							.build();
					
					System.out.println("등록됨: " + date + ", isClosed=" + monday.isClosed());
					registeredIds.add(closedDayRepository.save(monday).getClosedId());
				}
			}
			date = date.plusDays(1);
		}
		
		return registeredIds;
	}
	
	//  전체 휴관일 등록(월요일, 설/추석 당일(수동 등록), 개관일)
	@Override
	public List<Long> registerHolidays(int year){
		
		List<Long> ids = new ArrayList<>();
		
		// 월별 월요일 등록
		for(int month = 1; month <= 12; month++) {
			ids.addAll(registerMondays(year, month));
		}
		
		// 명절(2025년 기준. 필요 시 외부 API나 DB로 관리 가능) 등록
		ids.add(registerClosedDay(ClosedDayDTO.builder()
				.closedDate(LocalDate.of(2025, 1, 29)) //설날
				.isClosed(true)
				.build()));
		
		ids.add(registerClosedDay(ClosedDayDTO.builder()
				.closedDate(LocalDate.of(2025, 10, 6)) //추석
				.isClosed(true)
				.build()));
		
		// 개관일 등록
		ids.add(registerClosedDay(ClosedDayDTO.builder()
				.closedDate(LocalDate.of(year, 7, 8))
				.isClosed(true)
				.build()));
		
		return ids;
	}
	

}
