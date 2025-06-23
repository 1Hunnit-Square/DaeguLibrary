package com.dglib.service.news;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;
import com.dglib.entity.news.News;
import com.dglib.repository.news.NewsRepository;
import com.dglib.repository.news.NewsSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminNewsServiceImpl implements AdminNewsService {

	private final NewsRepository newsRepository;
	private final ModelMapper modelMapper;

	@Override
	public Page<BoardListDTO> getList(BoardSearchDTO dto, Pageable pageable) {
		Specification<News> spec = NewsSpecifications.adminFilter(dto);

		return newsRepository.findAll(spec, pageable).map(news -> {
			BoardListDTO mapped = modelMapper.map(news, BoardListDTO.class);
			mapped.setNo(news.getNno());
			mapped.setWriterId(news.getMember().getMid());
			mapped.setName(news.getMember().getName());
			return mapped;
		});
	}
}
