package com.dglib.service.news;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.news.NewsDTO;
import com.dglib.dto.news.NewsDetailDTO;
import com.dglib.dto.news.NewsImageDTO;
import com.dglib.dto.news.NewsListDTO;
import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.dto.news.NewsUpdateDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.news.News;
import com.dglib.entity.news.NewsImage;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.news.NewsRepository;
import com.dglib.repository.news.NewsSpecifications;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NewsServiceImpl implements NewsService {

	private final NewsRepository newsRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final FileUtil fileUtil;

	// 등록
	@Override
	public void register(NewsDTO dto, List<MultipartFile> images, String dirName) {

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

		News news = new News();
		modelMapper.map(dto, news);
		news.setPostedAt(LocalDateTime.now());
		news.setMember(member);

		AtomicInteger index = new AtomicInteger(0);
		// 이미지 첨부
		List<Object> fileMap = fileUtil.saveFiles(images, dirName);
		if (fileMap != null) {
			List<NewsImage> fileList = fileMap.stream().map(image -> {
				int i = index.getAndIncrement();
				NewsImage file = new NewsImage();
				modelMapper.map(image, file);
				file.setNews(news);

				String url = dto.getUrlList().get(i);
				if (url != null && !"null".equals(url)) {
					String updatedContent = news.getContent().replace(url, "image://" + file.getFilePath());
					news.setContent(updatedContent);
				}
				return file;
			}).collect(Collectors.toList());

			news.setImages(fileList);
		}
		newsRepository.save(news);
	}

	// 상세보기
	public NewsDetailDTO getDetail(Long nno) {
		News news = newsRepository.findById(nno).orElseThrow(() -> new IllegalArgumentException("해당 뉴스가 존재하지 않습니다."));

		news.setViewCount(news.getViewCount() + 1);

		NewsDetailDTO dto = new NewsDetailDTO();
		modelMapper.map(news, dto);
		dto.setName(news.getMember().getName());

		List<NewsImage> imageList = news.getImages();
		if (imageList != null && !imageList.isEmpty()) {
			List<NewsImageDTO> fileDTOList = imageList.stream().map(image -> {
				NewsImageDTO fileDTO = new NewsImageDTO();
				modelMapper.map(image, fileDTO);
				return fileDTO;
			}).collect(Collectors.toList());

			dto.setImageDTO(fileDTOList);
		}

		return dto;
	}

	// 수정
	@Override
	public void update(Long nno, NewsUpdateDTO dto, List<MultipartFile> images, String dirName) {
		News news = newsRepository.findById(nno).orElseThrow(() -> new IllegalArgumentException("해당 보도자료가 존재하지 않습니다."));

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

		if (!JwtFilter.checkAuth(news.getMember().getMid())) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}

		modelMapper.map(dto, news);
		news.setModifiedAt(LocalDateTime.now());

		// 기존 이미지 삭제
		List<NewsImage> delImages = null;

		if (dto.getOldFiles() != null) {
			delImages = news.getImages().stream().filter(entity -> !dto.getOldFiles().contains(entity.getFilePath()))
					.collect(Collectors.toList());

		} else {
			delImages = news.getImages();
		}

		if (delImages != null && !delImages.isEmpty()) {
			news.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(NewsImage::getFilePath).collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}

		// 새로운 이미지 저장
		if (images != null && !images.isEmpty()) {
			AtomicInteger index = new AtomicInteger(0);
			List<Object> fileMap = fileUtil.saveFiles(images, dirName);
			List<NewsImage> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				NewsImage file = new NewsImage();
				modelMapper.map(obj, file);
				file.setNews(news);

				if (dto.getUrlList() != null && i < dto.getUrlList().size()) {
					String url = dto.getUrlList().get(i);
					if (!"null".equals(url)) {
						String updatedContent = news.getContent().replace(url, "image://" + file.getFilePath());
						news.setContent(updatedContent);
					}
				}

				return file;
			}).collect(Collectors.toList());

			news.getImages().addAll(fileList);
		}

		newsRepository.save(news);
	}

	// 검색
	@Override
	public Page<NewsListDTO> findAll(NewsSearchDTO searchDTO, Pageable pageable) {
		Specification<News> spec = NewsSpecifications.fromDTO(searchDTO);
		Page<News> newsList = newsRepository.findAll(spec, pageable);

		Page<NewsListDTO> result = newsList.map(news -> {
			NewsListDTO newsListDTO = new NewsListDTO();
			modelMapper.map(news, newsListDTO);
			newsListDTO.setName(news.getMember().getName());

			return newsListDTO;
		});

		return result;
	}

	// 상단고정
	@Override
	public List<NewsListDTO> findPinned() {
		Sort sort = Sort.by("postedAt").descending();
		List<News> newsList = newsRepository.findAllByIsPinnedAndIsHidden(true, false, sort); 
		List<NewsListDTO> dtoList = newsList.stream().map(news -> {
			NewsListDTO newsListDTO = new NewsListDTO();
			modelMapper.map(news, newsListDTO);
			newsListDTO.setName(news.getMember().getName());
			return newsListDTO;
		}).collect(Collectors.toList());
		return dtoList;
	}

	// 상위 n개
	@Override
	public List<NewsListDTO> findTop(int count) {
		Pageable pageable = PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "postedAt"));
		List<News> newsList = newsRepository.findAllByIsHidden(false, pageable).getContent();
		List<NewsListDTO> dtoList = newsList.stream().map(news -> {
			NewsListDTO newsListDTO = new NewsListDTO();
			modelMapper.map(news, newsListDTO);
			return newsListDTO;
		}).collect(Collectors.toList());
		return dtoList;

	}

	// 삭제
	@Override
	public void delete(Long nno) {

		News news = newsRepository.findById(nno).orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));

		if (!JwtFilter.checkAuth(news.getMember().getMid())) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		newsRepository.deleteById(nno);

		List<NewsImage> delImages = null; // 기존 파일 전부 삭제

		delImages = news.getImages();

		if (delImages != null && !delImages.isEmpty()) {
			news.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(NewsImage::getFilePath).collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}
	}
}
