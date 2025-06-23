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
    public Page<BoardListDTO> getList(BoardSearchDTO dto, Pageable pageable) {
        Specification<Notice> spec = NoticeSpecifications.adminFilter(dto);

        if (dto.getIsHidden() != null) {
            spec = spec.and(NoticeSpecifications.isHidden(dto.getIsHidden()));
        }
        
        return noticeRepository.findAll(spec, pageable)
                .map(notice -> {
                    BoardListDTO mapped = modelMapper.map(notice, BoardListDTO.class);
                    mapped.setNo(notice.getAno());
                    mapped.setWriterId(notice.getMember().getMid());
                    mapped.setName(notice.getMember().getName());
                    return mapped;
                });
    }
}
