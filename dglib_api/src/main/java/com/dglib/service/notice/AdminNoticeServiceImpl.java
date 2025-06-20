package com.dglib.service.notice;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;
import com.dglib.entity.notice.Notice;
import com.dglib.repository.notice.NoticeRepository;
import com.dglib.repository.notice.NoticeSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminNoticeServiceImpl implements AdminNoticeService {

	private final NoticeRepository noticeRepository;
	private final ModelMapper modelMapper;

	@Override
	public Page<BoardListDTO> getBoardList(BoardSearchDTO searchDTO, Pageable pageable) {
		Specification<Notice> spec = NoticeSpecifications.adminFilter(searchDTO);

		return noticeRepository.findAll(spec, pageable).map(notice -> {
			BoardListDTO dto = modelMapper.map(notice, BoardListDTO.class);
			dto.setWriterId(notice.getMember().getMid());
			dto.setName(notice.getMember().getName());
			return dto;
		});
	}
}
