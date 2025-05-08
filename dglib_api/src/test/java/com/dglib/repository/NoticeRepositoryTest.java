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
	
//	@Test
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
	
//	@Test
	@DisplayName("공지사항 수정 테스트")
	void testUpdate() {
        
        Notice notice = Notice.builder()
                .title("테스트 제목")
                .content("테스트 내용")
                .createDate(LocalDate.now())
                .viewCount(0)
                .isHidden(false)
                .isPinned(false)
                .build();

        Notice saved = noticeRepository.save(notice);

        
        saved.setTitle("수정 후 제목");
        saved.setPinned(true);
        
        noticeRepository.save(saved);

        
        Notice updated = noticeRepository.findById(saved.getAno()).orElseThrow();
        assertThat(updated.getTitle()).isEqualTo("수정 후 제목");
        assertThat(updated.isPinned()).isTrue();
    }
	
//	@Test
	@DisplayName("공지사항 삭제 테스트")
	void testDelete() {
		
		Notice notice = Notice.builder()
				.title("삭제 할 제목")
				.content("삭제 할 내용")
				.createDate(LocalDate.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.build();
		
		Notice saved = noticeRepository.save(notice);
		Long ano = saved.getAno();
		
		noticeRepository.deleteAll();
		
		boolean exists = noticeRepository.findById(ano).isPresent();
		assertThat(exists).isFalse();
		
	}
	

}
