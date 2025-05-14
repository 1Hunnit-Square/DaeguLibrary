package com.dglib.service.notice;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.notice.NoticeDTO;
import com.dglib.dto.notice.NoticeFileDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.notice.Notice;
import com.dglib.entity.notice.NoticeFile;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.notice.NoticeFileRepository;
import com.dglib.repository.notice.NoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {
	
	private final NoticeRepository noticeRepository;
	private final NoticeFileRepository noticeFileRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;
	
	@Override
	public Long registerNotice(NoticeDTO dto) {
		
		if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
	        throw new IllegalArgumentException("제목은 필수입니다.");
	    }
	    if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
	        throw new IllegalArgumentException("내용은 필수입니다.");
	    }
	    
		//작성자 조회
		 Member member = memberRepository.findById(dto.getMemberMid())
	                .orElseThrow(() -> new IllegalArgumentException("작성자 정보가 없습니다."));
		
		 // notice entity 생성
		Notice notice = Notice.builder()
				.title(dto.getTitle())
				.content(dto.getContent())
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(dto.isHidden())
				.isPinned(dto.isPinned())
				.member(member)
				.build();

		
		// 첨부파일 DTO → Entity 변환 후 notice에 add
        if (dto.getFiles() != null) {
            for (NoticeFileDTO fileDTO : dto.getFiles()) {
                NoticeFile file = NoticeFile.builder()
                        .originalName(fileDTO.getOriginalName())
                        .filePath(fileDTO.getFilePath())
                        .fileType(fileDTO.getFileType())
                        .build();

                notice.addFile(file); // 연관관계 설정
            }
        }
		
		// 저장
		Notice saved = noticeRepository.save(notice);
		return saved.getAno();
		
	}
	
	@Override
	public NoticeDTO get(Long ano) {
		// 공지사항 조회
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
		
		// 조회수 증가
		notice.setViewCount(notice.getViewCount() + 1);
		
		//
		NoticeDTO dto = modelMapper.map(notice, NoticeDTO.class);
		
		//
		dto.setMemberMid(notice.getMember().getMid());
		dto.setWriterName("관리자"); //프론트에 표시할 작성자 이름 고정
		
		//
		List<NoticeFileDTO> fileDTOList = notice.getFiles().stream()
				.map(file -> modelMapper.map(file, NoticeFileDTO.class))
				.collect(Collectors.toList());
		dto.setFiles(fileDTOList);
		return dto;
	}
	
	@Override
	public Page<NoticeDTO> getList(Pageable pageable, String keyword){
		
		//검색어 없으면 전체 조회
		Page<Notice> result = (keyword == null || keyword.isBlank())
		        ? noticeRepository.findVisibleNotices(pageable)
		        : noticeRepository.searchVisible(keyword, pageable);
		
		return result.map(notice -> {
			NoticeDTO dto = modelMapper.map(notice, NoticeDTO.class);
			dto.setMemberMid(notice.getMember().getMid());
			return dto;
		});
	}
	
	@Override
	public void update(Long ano, NoticeDTO dto) {
		
		if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
	        throw new IllegalArgumentException("제목은 필수입니다.");
	    }
	    if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
	        throw new IllegalArgumentException("내용은 필수입니다.");
	    }
	    
		//기존 공지사항 조회
		Notice notice = noticeRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
		
		// 제목, 내용, 고정/숨김 여부 수정
		notice.setTitle(dto.getTitle());
		notice.setContent(dto.getContent());
		notice.setPinned(dto.isPinned());
		notice.setHidden(dto.isHidden());
		notice.setModifiedAt(LocalDateTime.now());
		
		// 파일 업데이트(기존 파일 제거)
		notice.getFiles().clear();
		
		if(dto.getFiles() != null) {
			for(NoticeFileDTO fileDTO : dto.getFiles()) {
				NoticeFile file = NoticeFile.builder()
						.originalName(fileDTO.getOriginalName())
						.filePath(fileDTO.getFilePath())
						.fileType(fileDTO.getFileType())
						.build();
				
				notice.addFile(file);
			}
		}		
	}
	
	@Override
	public void delete(Long ano) {
		if(!noticeRepository.existsById(ano)) {
			throw new IllegalArgumentException("해당 게시글이 존재하지 않습니다.");			
		}		
		noticeRepository.deleteById(ano);
	}
}