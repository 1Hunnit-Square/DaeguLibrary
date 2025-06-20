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
public class AdminNewsServiceImpl implements AdminNewsService{
	
	private final NewsRepository newsRepository;
	private final ModelMapper modelMapper;

	@Override
	public Page<BoardListDTO> getBoardList(BoardSearchDTO searchDTO, Pageable pageable) {
		Specification<News> spec = NewsSpecifications.adminFilter(searchDTO);

		return newsRepository.findAll(spec, pageable).map(news -> {
			BoardListDTO dto = modelMapper.map(news, BoardListDTO.class);
			dto.setWriterId(news.getMember().getMid());
			dto.setName(news.getMember().getName());
			return dto;
		});
	}
}

