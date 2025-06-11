package com.dglib.service.news;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.news.NewsDTO;
import com.dglib.dto.news.NewsDetailDTO;
import com.dglib.dto.news.NewsListDTO;
import com.dglib.dto.news.NewsSearchDTO;

public class NewsServiceImpl implements NewsService{
	
	// 등록
	@Override
	public void register(NewsDTO dto, List<MultipartFile> images, String dirName) {
		
	}

	// 수정
	@Override
	public void update(Long nno, NewsDTO dto) {
		
	}

	// 상세 조회
	@Override
	public NewsDetailDTO getDetail(Long nno) {
		
		return null;
	}

	// 검색
	@Override
	public Page<NewsListDTO> findAll(NewsSearchDTO searchDTO, Pageable pageable){
		
		return null;
	}

	// 삭제
	@Override
	public void delete(Long nno) {
		
	}
}
