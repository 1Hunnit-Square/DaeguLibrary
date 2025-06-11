package com.dglib.service.gallery;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.gallery.GalleryDTO;
import com.dglib.dto.gallery.GalleryDetailDTO;
import com.dglib.dto.gallery.GalleryListDTO;
import com.dglib.dto.gallery.GallerySearchDTO;
import com.dglib.dto.gallery.GalleryUpdateDTO;

public interface GalleryService {

	// 등록
	void register(GalleryDTO dto, List<MultipartFile> images, String dirName);

	// 수정
	void update(Long gno, GalleryUpdateDTO dto, List<MultipartFile> images, String dirName);

	// 상세보기
	GalleryDetailDTO getDetail(Long gno);

	// 검색
	Page<GalleryListDTO> findAll(GallerySearchDTO searchDTO, Pageable pageable);

	// 삭제
	void delete(Long gno);
}
