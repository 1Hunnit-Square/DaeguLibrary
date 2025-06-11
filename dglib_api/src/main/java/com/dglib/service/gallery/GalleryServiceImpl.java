package com.dglib.service.gallery;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.gallery.GalleryDTO;
import com.dglib.dto.gallery.GalleryDetailDTO;
import com.dglib.dto.gallery.GalleryImageDTO;
import com.dglib.dto.gallery.GalleryListDTO;
import com.dglib.dto.gallery.GallerySearchDTO;
import com.dglib.dto.gallery.GalleryUpdateDTO;
import com.dglib.entity.gallery.Gallery;
import com.dglib.entity.gallery.GalleryImage;
import com.dglib.entity.member.Member;
import com.dglib.repository.gallery.GalleryRepository;
import com.dglib.repository.gallery.GallerySpecifications;
import com.dglib.repository.member.MemberRepository;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class GalleryServiceImpl implements GalleryService {

	private final GalleryRepository galleryRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final FileUtil fileUtil;

	// 등록
	@Override
	public void register(GalleryDTO dto, List<MultipartFile> images, String dirName) {

		if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		}
		if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		Pattern phonePattern = Pattern.compile("01[016789]-?\\d{3,4}-?\\d{4}");
		Matcher matcher = phonePattern.matcher(dto.getContent());
		if (matcher.find()) {
			throw new IllegalArgumentException("휴대폰 번호는 입력할 수 없습니다.");
		}

		Member member = memberRepository.findById(dto.getMid())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));

		Gallery gallery = new Gallery();
		modelMapper.map(dto, gallery);
		gallery.setPostedAt(LocalDateTime.now());
		gallery.setMember(member);

		AtomicInteger index = new AtomicInteger(0);
		// 이미지 첨부
		List<Object> fileMap = fileUtil.saveFiles(images, dirName);
		if (fileMap != null) {
			List<GalleryImage> fileList = fileMap.stream().map(image -> {
				int i = index.getAndIncrement();
				GalleryImage file = new GalleryImage();
				modelMapper.map(image, file);
				file.setGallery(gallery);

				String url = dto.getUrlList().get(i);
				if (url != null && !"null".equals(url)) {
					String updatedContent = gallery.getContent().replace(url, "image://" + file.getFilePath());
					gallery.setContent(updatedContent);
				}
				return file;
			}).collect(Collectors.toList());

			gallery.setImages(fileList);
		}
		galleryRepository.save(gallery);
	}

	// 수정
	@Override
	public void update(Long gno, GalleryUpdateDTO dto, List<MultipartFile> images, String dirName) {
		Gallery gallery = galleryRepository.findById(gno)
				.orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

		if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		}

		if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}

		Pattern phonePattern = Pattern.compile("01[016789]-?\\d{3,4}-?\\d{4}");
		Matcher matcher = phonePattern.matcher(dto.getContent());
		if (matcher.find()) {
			throw new IllegalArgumentException("휴대폰 번호는 입력할 수 없습니다.");
		}

		if (!JwtFilter.checkAuth(gallery.getMember().getMid())) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}

		modelMapper.map(dto, gallery);
		gallery.setModifiedAt(LocalDateTime.now());

		// 기존 이미지 삭제
		List<GalleryImage> delImages = null;

		if (dto.getOldFiles() != null) {
			delImages = gallery.getImages().stream().filter(entity -> 
			!dto.getOldFiles().contains(entity.getFilePath()))
					.collect(Collectors.toList());

		} else {
			delImages = gallery.getImages();
		}

		if (delImages != null && !delImages.isEmpty()) {
			gallery.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(GalleryImage::getFilePath)
					.collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}

		// 새로운 이미지 저장
		if (images != null && !images.isEmpty()) {
			AtomicInteger index = new AtomicInteger(0);
			List<Object> fileMap = fileUtil.saveFiles(images, dirName);
			List<GalleryImage> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				GalleryImage file = new GalleryImage();
				modelMapper.map(obj, file);
				file.setGallery(gallery);

				if (dto.getUrlList() != null && i < dto.getUrlList().size()) {
					String url = dto.getUrlList().get(i);
					if (!"null".equals(url)) {
						String updatedContent = gallery.getContent().replace(url, "image://" + file.getFilePath());
						gallery.setContent(updatedContent);
					}
				}

				return file;
			}).collect(Collectors.toList());

			gallery.getImages().addAll(fileList);
		}

		galleryRepository.save(gallery);
	}

	// 상세보기
	@Override
	public GalleryDetailDTO getDetail(Long gno) {
		Gallery gallery = galleryRepository.findById(gno)
				.orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

		gallery.setViewCount(gallery.getViewCount() + 1);

		GalleryDetailDTO dto = new GalleryDetailDTO();
		modelMapper.map(gallery, dto);
		dto.setName(gallery.getMember().getName());

		List<GalleryImage> imageList = gallery.getImages();
		if (imageList != null && !imageList.isEmpty()) {
			List<GalleryImageDTO> fileDTOList = imageList.stream().map(image -> {
				GalleryImageDTO fileDTO = new GalleryImageDTO();
				modelMapper.map(image, fileDTO);
				return fileDTO;
			}).collect(Collectors.toList());

			dto.setImageDTO(fileDTOList);
		}

		return dto;
	}

	// 리스트
	@Override
	public Page<GalleryListDTO> findAll(GallerySearchDTO searchDTO, Pageable pageable) {

		Specification<Gallery> spec = GallerySpecifications.fromDTO(searchDTO);
		Page<Gallery> galleryList = galleryRepository.findAll(spec, pageable);

		Page<GalleryListDTO> result = galleryList.map(gallery -> {
			GalleryListDTO galleryListDTO = new GalleryListDTO();
			modelMapper.map(gallery, galleryListDTO);
			galleryListDTO.setName(gallery.getMember().getName());

			List<GalleryImage> images = gallery.getImages();
			if(images!=null && !images.isEmpty()) {
				String thumbPath = images.get(0).getFilePath() + "?type=thumbnail";
				galleryListDTO.setThumbnailPath(thumbPath);
			}
			return galleryListDTO;
		});

		return result;
	}

	// 삭제
	@Override
	public void delete(Long gno) {
		Gallery gallery = galleryRepository.findById(gno)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));

		if (!JwtFilter.checkAuth(gallery.getMember().getMid())) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		galleryRepository.deleteById(gno);

		List<GalleryImage> delImages = null; // 기존 파일 전부 삭제

		delImages = gallery.getImages();

		if (delImages != null && !delImages.isEmpty()) {
			gallery.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(GalleryImage::getFilePath).collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}
	}
}
