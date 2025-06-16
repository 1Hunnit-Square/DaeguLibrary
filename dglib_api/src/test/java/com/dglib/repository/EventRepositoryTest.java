//package com.dglib.repository;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.List;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.annotation.Rollback;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.dglib.entity.event.Event;
//import com.dglib.entity.event.EventImage;
//import com.dglib.entity.member.Member;
//import com.dglib.entity.member.MemberRole;
//import com.dglib.entity.member.MemberState;
//import com.dglib.repository.event.EventBannerRepository;
//import com.dglib.repository.event.EventImageRepository;
//import com.dglib.repository.event.EventRepository;
//import com.dglib.repository.member.MemberRepository;
//
//@SpringBootTest
//public class EventRepositoryTest {
//	
//	@Autowired
//	private EventRepository eventRepository;
//	@Autowired
//	private EventImageRepository eventImageRepository;
//	@Autowired
//	private EventBannerRepository eventBannerRepository;
//	@Autowired
//	private MemberRepository memberRepository;
//
//	
//	Member adminMember;
//	Event testEvent;
//	
//	@BeforeEach
//	public void setup() {
//		this.adminMember = Member.builder()
//	            .mid("admintester")
//	            .pw("00000")
//	            .name("관리자테스터")
//	            .mno("1111")
//	            .gender("F")
//	            .birthDate(LocalDate.of(2025, 1, 1))
//	            .phone("01099999999")
//	            .addr("대전시 서구 어쩌구동")
//	            .email("testadmin@dglib.com")
//	            .checkSms(true)
//	            .checkEmail(true)
//	            .role(MemberRole.ADMIN)
//	            .state(MemberState.NORMAL)
//	            .build();
//	    memberRepository.save(adminMember);
//	    
//	    
//	    testEvent = Event.builder()
//				.title("새소식 제목")
//				.content("새소식 내용")
//				.postedAt(LocalDateTime.now())
//				.viewCount(0)
//				.isHidden(false)
//				.isPinned(false)
//				.member(adminMember)
//				.build();
//			
//		this.testEvent = eventRepository.save(testEvent);
//		
//		}
//	
//	
//	
////	@Test
//	@DisplayName("새소식 등록 테스트")
//	void testCreateEvent() {
//		Event event = Event.builder()
//				.title("새소식 제목")
//				.content("새소식 내용")
//				.postedAt(LocalDateTime.now())
//				.viewCount(0)
//				.isHidden(false)
//				.isPinned(false)
//				.member(adminMember)
//				.build();
//		
//		Event saved = eventRepository.save(event);
//		
//		assertThat(saved.getEno()).isNotNull();
//		assertThat(saved.getMember()).isEqualTo(adminMember);
//	}
//	
////	@Test
//	@Transactional
//	@Rollback(false)
//	@DisplayName("새소식, 이미지 등록 및 조회")
//	void testCheck() {
//		Event event = Event.builder()
//				.title("새소식 조회")
//				.content("새소식 내용 조회")
//				.postedAt(LocalDateTime.now())
//				.viewCount(0)
//				.isHidden(false)
//				.isPinned(false)
//				.member(adminMember)
//				.build();
//		
//		EventImage image = EventImage.builder()
//				.filePath("/img/test.jpg")
//				.originalName("test.jpg")
//				.event(event)
//				.build();
//		event.addImage(image);
//			
//	    Event savedEvent = eventRepository.save(event); //event 엔티티 저장
//				
//		Event found = eventRepository.findById(savedEvent.getEno()).orElseThrow();
//		List<EventImage> foundImages = eventImageRepository.findByEvent_Eno(savedEvent.getEno());		
//		
//	}
//	
////	@Test
//	@Transactional
//	@Rollback(false)
//	@DisplayName("새소식, 이미지 수정 테스트")
//	void updateTest() {
//		Event eventUpdate = Event.builder()
//				.title("새소식 수정 조회")
//				.content("새소식 수정 내용 조회")
//				.postedAt(LocalDateTime.now())
//				.viewCount(0)
//				.isHidden(false)
//				.isPinned(false)
//				.member(adminMember)
//				.build();
//		Event savedEvent = eventRepository.save(eventUpdate);
//		
//		EventImage image = EventImage.builder()
//				.filePath("/img/test2.jpg")
//				.originalName("test2.jpg")
//				.event(eventUpdate)
//				.build();
//		savedEvent.addImage(image);
//		
//		savedEvent.setTitle("수정 후 제목");
//		savedEvent.setContent("수정 후 내용");
//		
//        Event updatedEvent = eventRepository.save(savedEvent);
//        
//	}
//	
//    @Test
//    @Transactional
//    @Rollback(false)
//    @DisplayName("새소식 삭제 테스트")
//    void deleteTest() {
//
//    	Long deleteTest = testEvent.getEno();
//    	
//    	eventRepository.deleteById(deleteTest);
//    	
//    	List<EventImage> foundImages = eventImageRepository.findByEvent_Eno(deleteTest);
//	
//    	System.out.println(deleteTest);
//	}
//	
//
//}
