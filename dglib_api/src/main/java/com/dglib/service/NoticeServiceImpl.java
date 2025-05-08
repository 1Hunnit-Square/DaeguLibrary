//package com.dglib.service;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;
//import java.util.stream.Collectors;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.dglib.dto.NoticeDTO;
//import com.dglib.entity.Member;
//import com.dglib.entity.Notice;
//import com.dglib.entity.NoticeImage;
//import com.dglib.repository.NoticeRepository;
//
//import lombok.RequiredArgsConstructor;
//
//@Service
//@RequiredArgsConstructor
//@Transactional
//public class NoticeServiceImpl implements NoticeService {
//	
//	private final NoticeRepository noticeRepository;
//	
//	@Override
//	public void register(NoticeDTO dto, Member member) {
//		
//		if(dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
//			throw new IllegalArgumentException("제목을 입력해주세요.");			
//		}
//		
//		if(dto.getContent() == null || dto.getContent().trim().isEmpty()) {
//			throw new IllegalArgumentException("내용을 입력해주세요.");			
//		}
//		
//		Pattern phonePattern = Pattern.compile("01[016789]-?\\d{3,4}-?\\d{4}");
//		Matcher matcher = phonePattern.matcher(dto.getContent());
//		if(matcher.find()) {
//			throw new IllegalArgumentException("휴대폰 번호는 입력할 수 없습니다.");
//		}
//		
//		Notice notice = Notice.builder()
//				.title(dto.getTitle())
//				.content(dto.getContent())
//                .createDate(LocalDate.now())
//                .viewCount(0)
//                .isHidden(dto.isHidden())
//                .isPinned(dto.isPinned())
//                .member(member)
//                .build();
//		
//		// 이미지
//		if (dto.getImages() != null && !dto.getImages().isEmpty()) {
//			List<NoticeImage> imageList = dto.getImages().stream()
//					.map(imgDTO -> NoticeImage.builder()
//							.imageUrl(imgDTO.getImageUrl())
//							.originalFilename(imgDTO.getOriginalFilename())
//							.notice(notice) //FK
//							.build())
//					.collect(Collectors.toList());
//			notice.setImages(imageList);
//		}
//
//        noticeRepository.save(notice);
//	}
//	
//	@Override
//	public void update(Long ano, NoticeDTO dto) {
//		Notice notice = noticeRepository.findById(ano)
//				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
//		
//		notice.setTitle(dto.getTitle());
//		notice.setContent(dto.getContent());
//		notice.setModifyDate(LocalDate.now());
//		notice.setHidden(dto.isHidden());
//		notice.setPinned(dto.isPinned());
//	}
//	
//	@Override
//	public NoticeDTO get(Long ano) {
//		Notice notice = noticeRepository.findById(ano)
//				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
//		
//	}
//	
//	@Override
//	public List<NoticeDTO> getList(){
//		
//	}
//	
//	@Override
//	public List<NoticeDTO> getPagedList(Pageable pageable){
//		
//	}
//	
//	@Override
//	public void delete(Long ano) {
//		noticeRepository.deleteById(ano);	
//	}
//
//}
