package com.dglib.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.Notice;

@SpringBootTest
public class NoticeRepositoryTest {
	
	@Autowired
	private NoticeRepository noticeRepository;
	
	@Test
	@DisplayName("공지사항 저장 및 조회 테스트")
	void testSaveAndFind() {
		Notice notice = Notice.builder()
				.title("테스트 제목")
				.content("테스트 내용")
				.createDate(LocalDate.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.build();
		
		noticeRepository.save(notice);
		List<Notice> list = noticeRepository.findAll();
		
		//테스트 결과 검증
		assertThat(list).isNotEmpty();
		assertThat(list.get(0).getTitle()).isEqualTo("테스트 제목");
	}
	

}
