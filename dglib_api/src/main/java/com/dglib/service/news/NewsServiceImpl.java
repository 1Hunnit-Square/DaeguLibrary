package com.dglib.service.news;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

import com.dglib.dto.news.NewsDTO;
import com.dglib.dto.news.NewsDetailDTO;
import com.dglib.dto.news.NewsFileDTO;
import com.dglib.dto.news.NewsListDTO;
import com.dglib.dto.news.NewsSearchDTO;
import com.dglib.dto.news.NewsUpdateDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.news.News;
import com.dglib.entity.news.NewsImage;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.news.NewsImageRepository;
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
	private final NewsImageRepository newsImageRepository;

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

	// 상세 조회
	public NewsDetailDTO getDetail(Long nno) {
		News news = newsRepository.findById(nno)
				.orElseThrow(() -> new IllegalArgumentException("해당 뉴스가 존재하지 않습니다."));

		news.setViewCount(news.getViewCount() + 1);

		NewsDetailDTO dto = new NewsDetailDTO();
		modelMapper.map(news, dto);
		dto.setName(news.getMember().getName());
		
		List<NewsImage> imageList = news.getImages();
		if (imageList != null && !imageList.isEmpty()) {
			List<NewsFileDTO> fileDTOList = imageList.stream().map(image -> {
				NewsFileDTO fileDTO = new NewsFileDTO();
				modelMapper.map(image, fileDTO);
				return fileDTO;
			}).collect(Collectors.toList());

			dto.setFileDTO(fileDTOList);
		}

		return dto;
	}

	// 수정
	@Override
	public void update(Long nno, NewsUpdateDTO dto, List<MultipartFile> files) {

	    News news = newsRepository.findById(nno)
	            .orElseThrow(() -> new IllegalArgumentException("해당 보도자료가 존재하지 않습니다."));

	    if(dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
	         throw new IllegalArgumentException("제목을 입력해주세요.");         
	      }
	      
	      if(dto.getContent() == null || dto.getContent().trim().isEmpty()) {
	         throw new IllegalArgumentException("내용을 입력해주세요.");         
	      }
	      
	      Pattern phonePattern = Pattern.compile("01[016789]-?\\d{3,4}-?\\d{4}");
	      Matcher matcher = phonePattern.matcher(dto.getContent());
	      if(matcher.find()) {
	         throw new IllegalArgumentException("휴대폰 번호는 입력할 수 없습니다.");
	      }
	      
	      if(!JwtFilter.checkAuth(news.getMember().getMid())) {
	         throw new IllegalArgumentException("수정 권한이 없습니다.");
	      }
	      
	    modelMapper.map(dto, news); // title, content, hidden, pinned 매핑
	    news.setModifiedAt(LocalDateTime.now());

	    // 기존 이미지 제거
	    List<NewsImage> oldImages = newsImageRepository.findByNews_Nno(nno);
	    newsImageRepository.deleteAll(oldImages);

	    // 새 이미지 저장 및 URL 반영
	    List<NewsImage> imageList = new ArrayList<>();
	    if (files != null && !files.isEmpty()) {
	        List<Object> saved = fileUtil.saveFiles(files, "news");

	        AtomicInteger index = new AtomicInteger(0);
	        for (Object obj : saved) {
	            NewsImage img = modelMapper.map(obj, NewsImage.class);
	            img.setNews(news);
	            
	            int i = index.getAndIncrement();
	            if (dto.getUrlList() != null && i < dto.getUrlList().size()) {
	                String url = dto.getUrlList().get(i);
	                if (!"null".equals(url)) {
	                    news.setContent(news.getContent().replace(url, "image://" + img.getFilePath()));
	                }
	            }
	            imageList.add(img);
	        }
	    }

	    news.setImages(imageList);
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

	// 삭제
	@Override
	public void delete(Long nno) {
	    News news = newsRepository.findById(nno)
	            .orElseThrow(() -> new IllegalArgumentException("해당 뉴스가 존재하지 않습니다."));

	    newsImageRepository.deleteByNews(news);
	    newsRepository.delete(news);
	}
}
