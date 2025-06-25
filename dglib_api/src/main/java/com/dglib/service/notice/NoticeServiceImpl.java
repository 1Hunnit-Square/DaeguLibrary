package com.dglib.service.notice;

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

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.dto.notice.NoticeDetailDTO;
import com.dglib.dto.notice.NoticeFileDTO;
import com.dglib.dto.notice.NoticeListDTO;
import com.dglib.dto.notice.NoticeModDTO;
import com.dglib.dto.notice.NoticeSearchDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.notice.Notice;
import com.dglib.entity.notice.NoticeFile;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.notice.NoticeRepository;
import com.dglib.repository.notice.NoticeSpecifications;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.util.FileUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {
	
	private final NoticeRepository noticeRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	private final FileUtil fileUtil;

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
		
		Member member = memberRepository.findById(JwtFilter.getMid()).orElseThrow(() -> new IllegalArgumentException("User not found"));
		Notice notice = new Notice();
		modelMapper.map(dto, notice);
		notice.setPostedAt(LocalDateTime.now());
		notice.setMember(member);
		
		// 파일첨부
		AtomicInteger index = new AtomicInteger(0);
		List<Object> fileMap = fileUtil.saveFiles(files, dirName);
		if(fileMap != null) {
			List<NoticeFile> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				NoticeFile file = new NoticeFile();
				modelMapper.map(obj, file);

				if(!dto.getUrlList().get(i).equals("null")) {
					file.setFileType("image");
					String content = notice.getContent().replace(dto.getUrlList().get(i), "image://"+file.getFilePath());
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
		dto.setWriterMid(notice.getMember().getMid());
		
		List<NoticeFile> fileList = notice.getFiles(); // 이미지 불러오기
		if(fileList != null) {
			List<NoticeFileDTO> dtoList = fileList.stream().map(file -> { 
				NoticeFileDTO fileDTO = new NoticeFileDTO();
				modelMapper.map(file, fileDTO);
				return fileDTO;

			}).collect(Collectors.toList());
			dto.setFileDTO(dtoList);
		}
		
		
		return dto;
	}
	
	@Override
	public void delete(Long ano) {
		
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
		
		if(!JwtFilter.checkAuth(notice.getMember().getMid())) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}
		
		noticeRepository.deleteById(ano);	

		List<NoticeFile> delFiles = null; // 기존 파일 전부 삭제

		delFiles = notice.getFiles();
		
		if(delFiles != null && !delFiles.isEmpty()) {
		notice.getFiles().removeAll(delFiles);
		
		List<String> filePaths = delFiles.stream().map(NoticeFile::getFilePath)
	    .collect(Collectors.toList());
		
		fileUtil.deleteFiles(filePaths);
		}
	}
	
	@Override
	public void update(Long ano, NoticeModDTO dto, List<MultipartFile> files, String dirName) {
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
		
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
		
		if(!JwtFilter.checkAuth(notice.getMember().getMid())) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}
		
		modelMapper.map(dto, notice);
		notice.setModifiedAt(LocalDateTime.now());

		//기존 파일 삭제
		List<NoticeFile> delFiles = null;

		if(dto.getOldFiles() != null) {
		delFiles = notice.getFiles().stream().filter(entity ->
		!dto.getOldFiles().contains(entity.getFilePath())
		).collect(Collectors.toList());
		
		
		} else {
		delFiles = notice.getFiles();
		}
		
		if(delFiles != null && !delFiles.isEmpty()) {
		notice.getFiles().removeAll(delFiles);
		
		List<String> filePaths = delFiles.stream().map(NoticeFile::getFilePath)
	    .collect(Collectors.toList());
		
		fileUtil.deleteFiles(filePaths);
		}
		
		
		//새로운 파일 추가
		AtomicInteger index = new AtomicInteger(0);
		List<Object> fileMap = fileUtil.saveFiles(files, dirName);
		if(fileMap != null) {
			List<NoticeFile> fileList = fileMap.stream().map(obj -> {
				int i = index.getAndIncrement();
				NoticeFile file = new NoticeFile();
				modelMapper.map(obj, file);

				if(!dto.getUrlList().get(i).equals("null")) {
					file.setFileType("image");
					String content = notice.getContent().replace(dto.getUrlList().get(i), "image://"+file.getFilePath());
					notice.setContent(content);
				} else 
					file.setFileType("other");
				file.setNotice(notice);
				return file;
			}).collect(Collectors.toList());
			notice.getFiles().addAll(fileList); //기존 file에 추가
				
			}
		
		noticeRepository.save(notice);
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
	public List<NoticeListDTO> findPinned() {
		Sort sort = Sort.by("postedAt").descending();
		List<Notice> noticeList = noticeRepository.findAllByIsPinnedAndIsHidden(true, false, sort);
		List<NoticeListDTO> dtoList = noticeList.stream()
				.map(notice -> {
					NoticeListDTO noticeListDTO = new NoticeListDTO();
					modelMapper.map(notice, noticeListDTO);
					noticeListDTO.setName(notice.getMember().getName());
					return noticeListDTO;
					})
				.collect(Collectors.toList());
		
		return dtoList;
	}

	@Override
	public List<NoticeListDTO> findTop(int count) {
		Pageable pageable = PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "postedAt"));
		List<Notice> noticeList = noticeRepository.findAllByIsHidden(false, pageable).getContent();
		List<NoticeListDTO> dtoList = noticeList.stream()
				.map(notice -> {
					NoticeListDTO noticeListDTO = new NoticeListDTO();
					modelMapper.map(notice, noticeListDTO);
					return noticeListDTO;
					})
				.collect(Collectors.toList());
		
		return dtoList;
	}



}


