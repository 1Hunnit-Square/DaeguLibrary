package com.dglib.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.NoticeDTO;
import com.dglib.entity.Member;
import com.dglib.entity.Notice;
import com.dglib.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {
	
	private final NoticeRepository noticeRepository;
	
	@Override
	public void register(NoticeDTO dto, Member member) {
		Notice notice = Notice.builder()
				.title(dto.getTitle())
				.content(dto.getContent())
                .createDate(LocalDate.now())
                .viewCount(0)
                .isHidden(dto.isHidden())
                .isPinned(dto.isPinned())
                .member(member)
                .build();

        noticeRepository.save(notice);
	}
	

}
