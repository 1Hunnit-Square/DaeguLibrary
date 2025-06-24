package com.dglib.service.admin;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.admin.BoardListDTO;
import com.dglib.dto.admin.BoardSearchDTO;
import com.dglib.entity.event.Event;
import com.dglib.entity.gallery.Gallery;
import com.dglib.entity.news.News;
import com.dglib.entity.notice.Notice;
import com.dglib.repository.event.EventRepository;
import com.dglib.repository.event.EventSpecifications;
import com.dglib.repository.gallery.GalleryRepository;
import com.dglib.repository.gallery.GallerySpecifications;
import com.dglib.repository.news.NewsRepository;
import com.dglib.repository.news.NewsSpecifications;
import com.dglib.repository.notice.NoticeRepository;
import com.dglib.repository.notice.NoticeSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminBoardServiceImpl implements AdminBoardService {
	private final ModelMapper modelMapper;
	private final NewsRepository newsRepository;
	private final NoticeRepository noticeRepository;
	private final EventRepository eventRepository;
	private final GalleryRepository galleryRepository;

	@Override
	public Page<BoardListDTO> getNewsList(BoardSearchDTO dto, Pageable pageable) {
		Specification<News> spec = NewsSpecifications.adminFilter(dto);

		if (dto.getIsHidden() != null) {
			spec = spec.and(NewsSpecifications.isHidden(dto.getIsHidden()));
		}

		return newsRepository.findAll(spec, pageable).map(news -> {
			BoardListDTO mapped = modelMapper.map(news, BoardListDTO.class);
			mapped.setNo(news.getNno());
			mapped.setWriterId(news.getMember().getMid());
			mapped.setName(news.getMember().getName());
			return mapped;
		});
	}

	@Override
	public Page<BoardListDTO> getNoticeList(BoardSearchDTO dto, Pageable pageable) {
		Specification<Notice> spec = NoticeSpecifications.adminFilter(dto);

		if (dto.getIsHidden() != null) {
			spec = spec.and(NoticeSpecifications.isHidden(dto.getIsHidden()));
		}

		return noticeRepository.findAll(spec, pageable).map(notice -> {
			BoardListDTO mapped = modelMapper.map(notice, BoardListDTO.class);
			mapped.setNo(notice.getAno());
			mapped.setWriterId(notice.getMember().getMid());
			mapped.setName(notice.getMember().getName());
			return mapped;
		});
	}

	@Override
	public Page<BoardListDTO> getEventList(BoardSearchDTO dto, Pageable pageable) {
		Specification<Event> spec = EventSpecifications.adminFilter(dto);

		if (dto.getIsHidden() != null) {
			spec = spec.and(EventSpecifications.isHidden(dto.getIsHidden()));
		}

		return eventRepository.findAll(spec, pageable).map(event -> {
			BoardListDTO mapped = modelMapper.map(event, BoardListDTO.class);
			mapped.setNo(event.getEno());
			mapped.setWriterId(event.getMember().getMid());
			mapped.setName(event.getMember().getName());
			return mapped;
		});
	}

	@Override
	public Page<BoardListDTO> getGalleryList(BoardSearchDTO dto, Pageable pageable) {
		Specification<Gallery> spec = GallerySpecifications.adminFilter(dto);

		if (dto.getIsHidden() != null) {
			spec = spec.and(GallerySpecifications.isHidden(dto.getIsHidden()));
		}

		return galleryRepository.findAll(spec, pageable).map(gallery -> {
			BoardListDTO mapped = modelMapper.map(gallery, BoardListDTO.class);
			mapped.setNo(gallery.getGno());
			mapped.setWriterId(gallery.getMember().getMid());
			mapped.setName(gallery.getMember().getName());
			return mapped;
		});
	}

	@Override
	public void hideBoards(String boardType, List<Long> ids, boolean isHidden) {
		if ("notice".equalsIgnoreCase(boardType)) {
			List<Notice> noticeList = noticeRepository.findAllById(ids);
			for (Notice notice : noticeList) {
				notice.setHidden(isHidden);
			}
			noticeRepository.saveAll(noticeList);
		} else if ("news".equalsIgnoreCase(boardType)) {
			List<News> newsList = newsRepository.findAllById(ids);
			for (News news : newsList) {
				news.setHidden(isHidden);
			}
			newsRepository.saveAll(newsList);
		} else if ("event".equalsIgnoreCase(boardType)) {
			List<Event> eventList = eventRepository.findAllById(ids);
			for (Event event : eventList) {
				event.setHidden(isHidden);
			}
			eventRepository.saveAll(eventList);
		} else if ("gallery".equalsIgnoreCase(boardType)) {
			List<Gallery> galleryList = galleryRepository.findAllById(ids);
			for (Gallery gallery : galleryList) {
				gallery.setHidden(isHidden);
			}
			galleryRepository.saveAll(galleryList);
		}

	}

	@Override
	public void deleteBoards(String boardType, List<Long> ids) {
		if ("notice".equalsIgnoreCase(boardType)) {
			noticeRepository.deleteAllById(ids);
		} else if ("news".equalsIgnoreCase(boardType)) {
			newsRepository.deleteAllById(ids);
		} else if ("event".equalsIgnoreCase(boardType)) {
			eventRepository.deleteAllById(ids);
		} else if ("gallery".equalsIgnoreCase(boardType)) {
			galleryRepository.deleteAllById(ids);
		}

	}
}
