package com.dglib.service.event;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

import com.dglib.dto.event.EventBannerDTO;
import com.dglib.dto.event.EventDTO;
import com.dglib.dto.event.EventDetailDTO;
import com.dglib.dto.event.EventImageDTO;
import com.dglib.dto.event.EventListDTO;
import com.dglib.dto.event.EventSearchDTO;
import com.dglib.dto.event.EventUpdateDTO;
import com.dglib.entity.event.Event;
import com.dglib.entity.event.EventBanner;
import com.dglib.entity.event.EventImage;
import com.dglib.entity.member.Member;
import com.dglib.repository.event.EventBannerRepository;
import com.dglib.repository.event.EventRepository;
import com.dglib.repository.event.EventSpecifications;
import com.dglib.repository.member.MemberRepository;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {
	private final EventRepository eventRepository;
	private final EventBannerRepository eventBannerRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final FileUtil fileUtil;

	// 등록
	@Override
	public void register(EventDTO dto, List<MultipartFile> images, String dirName) {

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

		Event event = new Event();
		modelMapper.map(dto, event);
		event.setPostedAt(LocalDateTime.now());
		event.setMember(member);

		AtomicInteger index = new AtomicInteger(0);
		// 이미지 첨부
		List<Object> fileMap = fileUtil.saveFiles(images, dirName);
		if (fileMap != null) {
			List<EventImage> fileList = fileMap.stream().map(image -> {
				int i = index.getAndIncrement();
				EventImage file = new EventImage();
				modelMapper.map(image, file);
				file.setEvent(event);

				String url = dto.getUrlList().get(i);
				if (url != null && !"null".equals(url)) {
					String updatedContent = event.getContent().replace(url, "image://" + file.getFilePath());
					event.setContent(updatedContent);
				}
				return file;
			}).collect(Collectors.toList());

			event.setImages(fileList);
		}
		eventRepository.save(event);
	}

	// 상세보기
	public EventDetailDTO getDetail(Long eno) {
		Event event = eventRepository.findById(eno)
				.orElseThrow(() -> new IllegalArgumentException("해당 뉴스가 존재하지 않습니다."));

		event.setViewCount(event.getViewCount() + 1);

		EventDetailDTO dto = new EventDetailDTO();
		modelMapper.map(event, dto);
		dto.setName(event.getMember().getName());

		List<EventImage> imageList = event.getImages();
		if (imageList != null && !imageList.isEmpty()) {
			List<EventImageDTO> fileDTOList = imageList.stream().map(image -> {
				EventImageDTO fileDTO = new EventImageDTO();
				modelMapper.map(image, fileDTO);
				return fileDTO;
			}).collect(Collectors.toList());

			dto.setImageDTO(fileDTOList);
		}

		return dto;
	}

	// 수정
	@Override
	public void update(Long eno, EventUpdateDTO dto, List<MultipartFile> images, String dirName) {
		Event event = eventRepository.findById(eno)
				.orElseThrow(() -> new IllegalArgumentException("해당 보도자료가 존재하지 않습니다."));

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

		if (!JwtFilter.checkAuth(event.getMember().getMid())) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}

		modelMapper.map(dto, event);
		event.setModifiedAt(LocalDateTime.now());

		// 기존 이미지 삭제
		List<EventImage> delImages = null;

		if (dto.getOldFiles() != null) {
			delImages = event.getImages().stream().filter(entity -> !dto.getOldFiles().contains(entity.getFilePath()))
					.collect(Collectors.toList());

		} else {
			delImages = event.getImages();
		}

		if (delImages != null && !delImages.isEmpty()) {
			event.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(EventImage::getFilePath).collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}

		// 새로운 이미지 저장
		if (images != null && !images.isEmpty()) {
			AtomicInteger index = new AtomicInteger(0);
			List<Object> fileMap = fileUtil.saveFiles(images, dirName);
			List<EventImage> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				EventImage file = new EventImage();
				modelMapper.map(obj, file);
				file.setEvent(event);

				if (dto.getUrlList() != null && i < dto.getUrlList().size()) {
					String url = dto.getUrlList().get(i);
					if (!"null".equals(url)) {
						String updatedContent = event.getContent().replace(url, "image://" + file.getFilePath());
						event.setContent(updatedContent);
					}
				}

				return file;
			}).collect(Collectors.toList());

			event.getImages().addAll(fileList);
		}

		eventRepository.save(event);
	}

	// 검색
	@Override
	public Page<EventListDTO> findAll(EventSearchDTO searchDTO, Pageable pageable) {
		Specification<Event> spec = EventSpecifications.fromDTO(searchDTO);
		Page<Event> eventList = eventRepository.findAll(spec, pageable);

		Page<EventListDTO> result = eventList.map(event -> {
			EventListDTO eventListDTO = new EventListDTO();
			modelMapper.map(event, eventListDTO);
			eventListDTO.setName(event.getMember().getName());

			return eventListDTO;
		});

		return result;
	}

	// 상단고정
	@Override
	public List<EventListDTO> findPinned() {
		Sort sort = Sort.by("postedAt").descending();
		List<Event> eventList = eventRepository.findAllByIsPinnedAndIsHidden(true, false, sort);
		List<EventListDTO> dtoList = eventList.stream().map(event -> {
			EventListDTO eventListDTO = new EventListDTO();
			modelMapper.map(event, eventListDTO);
			eventListDTO.setName(event.getMember().getName());
			return eventListDTO;
		}).collect(Collectors.toList());
		return dtoList;
	}

	// 상위 n개
	@Override
	public List<EventListDTO> findTop(int count) {
		Pageable pageable = PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "postedAt"));
		List<Event> eventList = eventRepository.findAll(pageable).getContent();
		List<EventListDTO> dtoList = eventList.stream().map(event -> {
			EventListDTO eventListDTO = new EventListDTO();
			modelMapper.map(event, eventListDTO);
			return eventListDTO;
		}).collect(Collectors.toList());
		return dtoList;

	}

	// 삭제
	@Override
	public void delete(Long eno) {

		Event event = eventRepository.findById(eno)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));

		if (!JwtFilter.checkAuth(event.getMember().getMid())) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		eventRepository.deleteById(eno);

		List<EventImage> delImages = null; // 기존 파일 전부 삭제

		delImages = event.getImages();

		if (delImages != null && !delImages.isEmpty()) {
			event.getImages().removeAll(delImages);

			List<String> filePaths = delImages.stream().map(EventImage::getFilePath).collect(Collectors.toList());

			fileUtil.deleteFiles(filePaths);
		}
	}

	// 배너 목록 조회
	@Override
	public List<EventBannerDTO> getBannerList() {
		List<EventBanner> list = eventBannerRepository.findAll();

		return list.stream().map(b -> {
			EventBannerDTO dto = new EventBannerDTO();
			dto.setBno(b.getBno());
			dto.setImageName(b.getImageName());
			dto.setImageUrl(b.getImageUrl());
			dto.setEno(b.getEvent().getEno());
			dto.setIsPinned(b.getEvent().isPinned());
			return dto;
		}).toList();
	}

	// 배너 등록
	@Override
	public Long registerBanner(Long eventNo, MultipartFile file) {
		LocalDate today = LocalDate.now();
		long currentBannerCount = eventBannerRepository.count();

		if (currentBannerCount >= 6) {
			throw new IllegalStateException("배너는 최대 6개까지 등록할 수 있습니다.");
		}

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("배너 이미지를 첨부해주세요.");
		}

		if (!file.getContentType().startsWith("image")) {
			throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
		}

		// 중복 검사
		if (eventBannerRepository.existsByEvent_Eno(eventNo)) {
			throw new IllegalStateException("해당 이벤트에는 이미 배너가 등록되어 있습니다.");
		}

		List<Object> savedFiles = fileUtil.saveFiles(List.of(file), "event/banner");
		Map<String, String> fileMap = (Map<String, String>) savedFiles.get(0);

		String imageUrl = fileMap.get("filePath");
		String imageName = fileMap.get("originalName");

		Event event = eventRepository.findById(eventNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 이벤트가 존재하지 않습니다."));

		EventBanner banner = EventBanner.builder().event(event).imageName(imageName).imageUrl(imageUrl).build();

		eventBannerRepository.save(banner);
		return banner.getBno();
	}

	// 배너 삭제
	@Override
	public void deleteBanner(Long bno) {
		EventBanner banner = eventBannerRepository.findById(bno)
				.orElseThrow(() -> new IllegalArgumentException("배너가 존재하지 않습니다."));

		String imageUrl = banner.getImageUrl();
		if (imageUrl != null) {
			String fileName = Paths.get(imageUrl).getFileName().toString();
			String parent = Paths.get(imageUrl).getParent().toString();
			String thumbnailPath = parent + "/s_" + fileName;

			fileUtil.deleteFiles(List.of(imageUrl, thumbnailPath));
		}

		eventBannerRepository.deleteById(bno);
	}

}
