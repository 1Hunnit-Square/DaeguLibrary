package com.dglib.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.entity.EventImage;
import com.dglib.entity.Events;
import com.dglib.entity.Member;
import com.dglib.entity.MemberRole;
import com.dglib.entity.MemberState;

@SpringBootTest
public class EventsRepositoryTest {
	
	@Autowired
	private EventsRepository eventsRepository;
	@Autowired
	private EventImageRepository eventImageRepository;
	@Autowired
	private EventBannerRepository eventBannerRepository;
	@Autowired
	private MemberRepository memberRepository;

	
	Member adminMember;
	Events testEvent;
	
	@BeforeEach
	public void setup() {
		this.adminMember = Member.builder()
	            .mid("admintester")
	            .pw("00000")
	            .name("관리자테스터")
	            .mno("1111")
	            .gender("F")
	            .birthDate(LocalDate.of(2025, 1, 1))
	            .phone("01099999999")
	            .addr("대전시 서구 어쩌구동")
	            .email("testadmin@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .checkTerms(true)
	            .penalty(0)
	            .role(MemberRole.ADMIN)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(adminMember);
	    
	    
	    testEvent = Events.builder()
				.title("새소식 제목")
				.content("새소식 내용")
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.member(adminMember)
				.build();
			
		this.testEvent = eventsRepository.save(testEvent);
		
		}
	
	
	
//	@Test
	@DisplayName("새소식 등록 테스트")
	void testCreateEvent() {
		Events events = Events.builder()
				.title("새소식 제목")
				.content("새소식 내용")
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.member(adminMember)
				.build();
		
		Events saved = eventsRepository.save(events);
		
		assertThat(saved.getEno()).isNotNull();
		assertThat(saved.getMember()).isEqualTo(adminMember);
	}
	
//	@Test
	@Transactional
	@Rollback(false)
	@DisplayName("새소식, 이미지 등록 및 조회")
	void testCheck() {
		Events events = Events.builder()
				.title("새소식 조회")
				.content("새소식 내용 조회")
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.member(adminMember)
				.build();
		
		EventImage image = EventImage.builder()
				.imageUrl("/img/test.jpg")
				.originalFilename("test.jpg")
				.events(events)
				.build();
		events.addImage(image);
			
	    Events savedEvents = eventsRepository.save(events); //events 엔티티 저장
				
		Events found = eventsRepository.findById(savedEvents.getEno()).orElseThrow();
		List<EventImage> foundImages = eventImageRepository.findByEvents_Eno(savedEvents.getEno());		
		
	}
	
//	@Test
	@Transactional
	@Rollback(false)
	@DisplayName("새소식, 이미지 수정 테스트")
	void updateTest() {
		Events eventsUpdate = Events.builder()
				.title("새소식 수정 조회")
				.content("새소식 수정 내용 조회")
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.member(adminMember)
				.build();
		Events savedEvents = eventsRepository.save(eventsUpdate);
		
		EventImage image = EventImage.builder()
				.imageUrl("/img/test2.jpg")
				.originalFilename("test2.jpg")
				.events(eventsUpdate)
				.build();
		savedEvents.addImage(image);
		
		savedEvents.setTitle("수정 후 제목");
		savedEvents.setContent("수정 후 내용");
		
        Events updatedEvents = eventsRepository.save(savedEvents);
        
	}
	
    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("새소식 삭제 테스트")
    void deleteTest() {

    	Long deleteTest = testEvent.getEno();
    	
    	eventsRepository.deleteById(deleteTest);
    	
    	List<EventImage> foundImages = eventImageRepository.findByEvents_Eno(deleteTest);
	
    	System.out.println(deleteTest);
	}
	

}
