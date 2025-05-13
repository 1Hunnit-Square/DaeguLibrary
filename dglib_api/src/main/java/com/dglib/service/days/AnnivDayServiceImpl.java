package com.dglib.service.days;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.days.AnnivDayDTO;
import com.dglib.entity.days.AnnivDay;
import com.dglib.repository.days.AnnivDayRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class AnnivDayServiceImpl implements AnnivDayService {

	private final AnnivDayRepository annivDayRepository;
	private final ModelMapper modelMapper;

	@Override
	public Long registerAnnivDay(AnnivDayDTO dto) {
		AnnivDay entity = modelMapper.map(dto, AnnivDay.class);
		return annivDayRepository.save(entity).getAnnivNo();
	}

	@Override
	public AnnivDayDTO get(Long annivNo) {
		AnnivDay entity = annivDayRepository.findById(annivNo)
				.orElseThrow(() -> new IllegalArgumentException("일정 정보를 찾을 수 없습니다."));
		return modelMapper.map(entity, AnnivDayDTO.class);
	}

	@Override
	public List<AnnivDayDTO> getAll() {
		return annivDayRepository.findAll().stream().map(entity -> modelMapper.map(entity, AnnivDayDTO.class))
				.collect(Collectors.toList());
	}
	
	@Override
	public List<AnnivDayDTO> getByMonth(int year, int month) {
		LocalDate start = LocalDate.of(year, month, 1);
		LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
		return annivDayRepository.findByAnnivDateBetween(start, end).stream()
				.map(entity -> modelMapper.map(entity, AnnivDayDTO.class))
				.collect(Collectors.toList());
	}
	
	@Override
	public void updateAnnivDay(Long annivNo, AnnivDayDTO dto) {
		AnnivDay entity = annivDayRepository.findById(annivNo)
				.orElseThrow(() -> new IllegalArgumentException("수정할 일정이 존재하지 않습니다."));

		entity.setAnnivDate(dto.getAnnivDate());
		entity.setAnnivType(dto.getAnnivType());
		entity.setAnnivName(dto.getAnnivName());

		annivDayRepository.save(entity); // 수정 내용 저장
	}

	@Override
	public void delete(Long annivNo) {
		if (!annivDayRepository.existsById(annivNo)) {
			throw new IllegalArgumentException("삭제할 일정이 존재하지 않습니다.");
		}
		annivDayRepository.deleteById(annivNo);
	}

}
