package com.dglib.service.notice;

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

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.dto.notice.NoticeDetailDTO;
import com.dglib.dto.notice.NoticeFileDTO;
import com.dglib.dto.notice.NoticeListDTO;
import com.dglib.dto.notice.NoticeSearchDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.notice.Notice;
import com.dglib.entity.notice.NoticeFile;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.notice.NoticeFileRepository;
import com.dglib.repository.notice.NoticeRepository;
import com.dglib.repository.notice.NoticeSpecifications;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {
	
	private final NoticeRepository noticeRepository;
	private final NoticeFileRepository noticeFileRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final FileUtil fileUtil;
	private final String viewPath = "/api/view/";
	
	@Override
	public void register(NoticeDTO dto, List<MultipartFile> files, String dirName) {
		
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
		
		Member member = memberRepository.findById(dto.getMid()).orElseThrow(() -> new IllegalArgumentException("User not found"));
		Notice notice = new Notice();
		modelMapper.map(dto, notice);
		notice.setPostedAt(LocalDateTime.now());
		notice.setMember(member);
		
		
		AtomicInteger index = new AtomicInteger(0);
		// 파일첨부
		List<Object> fileMap = fileUtil.saveFiles(files, dirName);
		if(fileMap != null) {
			List<NoticeFile> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				NoticeFile file = new NoticeFile();
				modelMapper.map(obj, file);

				if(!dto.getUrlList().get(i).equals("null")) {
					file.setFileType("image");
					String content = notice.getContent().replace(dto.getUrlList().get(i), viewPath+file.getFilePath());
					notice.setContent(content);
				} else 
					file.setFileType("other");
				file.setNotice(notice);
				return file;
			}).collect(Collectors.toList());
			notice.setFiles(fileList);
				
			}
			
		noticeRepository.save(notice);
	}
	

	
	@Override
	public NoticeDetailDTO getDetail(Long ano) {
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
		
		notice.setViewCount(notice.getViewCount()+1); // 조회수 1 증가
		
		NoticeDetailDTO dto = new NoticeDetailDTO();
		modelMapper.map(notice, dto);
		dto.setName(notice.getMember().getName());
		
		List<NoticeFile> fileList = notice.getFiles(); // 이미지 불러오기
		if(fileList != null) {
			List<NoticeFileDTO> dtoList = fileList.stream().map(file -> { 
				NoticeFileDTO fileDTO = new NoticeFileDTO();
				modelMapper.map(file, fileDTO);
				fileDTO.setFilePath(viewPath + fileDTO.getFilePath());
				return fileDTO;

			}).collect(Collectors.toList());
			dto.setFileDTO(dtoList);
		}
		
		
		return dto;
	}
	
	@Override
	public void update(Long ano, NoticeDTO dto) {
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
		
		notice.setTitle(dto.getTitle());
		notice.setContent(dto.getContent());
		notice.setModifiedAt(LocalDateTime.now());
		notice.setHidden(dto.isHidden());
		notice.setPinned(dto.isPinned());
	}

	@Override
	public Page<NoticeListDTO> findAll (NoticeSearchDTO searchDTO, Pageable pageable) {
		Specification<Notice> spec = NoticeSpecifications.fromDTO(searchDTO);
		Page<Notice> noticeList = noticeRepository.findAll(spec, pageable);
		
		
		Page<NoticeListDTO> result = noticeList.map(notice -> {
			NoticeListDTO noticeListDTO = new NoticeListDTO();
			modelMapper.map(notice, noticeListDTO);
			noticeListDTO.setName(notice.getMember().getName());
	
				
			return noticeListDTO;	
		});
		
		return result;
	}
	
	@Override
	public void delete(Long ano) {
		noticeRepository.deleteById(ano);	
	}

}


