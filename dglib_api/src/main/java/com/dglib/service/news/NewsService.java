package com.dglib.service.news;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.news.NewsDTO;
import com.dglib.dto.news.NewsDetailDTO;
import com.dglib.dto.news.NewsListDTO;
import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.dto.news.NewsUpdateDTO;

public interface NewsService {

	//등록
	void register(NewsDTO dto, List<MultipartFile> images, String dirName);
	
	//수정
	void update(Long nno, NewsUpdateDTO dto, List<MultipartFile> images, String dirName);
	
	//상세보기
	NewsDetailDTO getDetail(Long nno);
	
	//검색
	Page<NewsListDTO> findAll (NewsSearchDTO searchDTO, Pageable pageable);
	
	
	//상단고정
	List<NewsListDTO> findPinned();
	
	//상위 n개
	List<NewsListDTO> findTop(int count);
	
	//삭제
	void delete(Long nno);
}
