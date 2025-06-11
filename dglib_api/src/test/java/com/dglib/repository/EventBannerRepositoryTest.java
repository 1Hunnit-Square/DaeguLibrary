package com.dglib.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.entity.event.Event;
import com.dglib.entity.event.EventBanner;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.event.EventBannerRepository;
import com.dglib.repository.event.EventRepository;
import com.dglib.repository.member.MemberRepository;

@SpringBootTest
public class EventBannerRepositoryTest {
	
	@Autowired
	private EventBannerRepository eventBannerRepository;
	@Autowired
	private EventRepository eventRepository;
	@Autowired
	private MemberRepository memberRepository;

	
	private Member adminMember;	
	private Event testEvent;
	
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
		        .role(MemberRole.ADMIN)
		        .state(MemberState.NORMAL)
		        .build();
		memberRepository.save(adminMember);
		
		testEvent = Event.builder()
				.title("새소식 제목")
				.content("새소식 내용")
				.postedAt(LocalDateTime.now())
				.viewCount(0)
				.isHidden(false)
				.isPinned(false)
				.member(adminMember)
				.build();

		eventRepository.save(testEvent);
	}
	
	
//	@Test
	@DisplayName("배너 등록")
	@Transactional
	@Rollback(false)
	void createBanner() {
		EventBanner banner = EventBanner.builder()
				.imageName("배너 이름")
				.imageUrl("이미지 Url")
				.event(testEvent)
				.build();
		
		EventBanner savedBanner = eventBannerRepository.save(banner);
        assertThat(savedBanner.getBno()).isNotNull();

	}
	
//	@Test
	@DisplayName("배너 조회")
	@Transactional
	@Rollback(false)
	void readBanner() {
		EventBanner banner = EventBanner.builder()
				.imageName("조회 배너")
				.imageUrl("조회 Url")
				.event(testEvent)
				.build();
		
		EventBanner savedBanner = eventBannerRepository.save(banner);
		
		// Event의 eno로 배너 조회
        EventBanner foundBanner = eventBannerRepository.findByEvent_Eno(testEvent.getEno()).orElse(null);
        
        assertThat(foundBanner).isNotNull();
        assertThat(foundBanner.getImageName()).isEqualTo("조회 배너");

	}
	
//	@Test
	@DisplayName("배너 수정")
	@Transactional
	@Rollback(false)
	void updateBanner() {
		EventBanner banner = EventBanner.builder()
				.imageName("배너 수정 전")
				.imageUrl("수정 전 Url")
				.event(testEvent)
				.build();
		
		EventBanner savedBanner = eventBannerRepository.save(banner);

		
		//배너 정보 수정
		savedBanner.setImageName("수정 후 배너");
        savedBanner.setImageUrl("/banner/after.jpg");
		eventBannerRepository.save(savedBanner);

        EventBanner foundBanner = eventBannerRepository.findByEvent_Eno(testEvent.getEno()).orElse(null);

        assertThat(foundBanner).isNotNull();
        assertThat(foundBanner.getImageName()).isEqualTo("수정 후 배너");
        assertThat(foundBanner.getImageUrl()).isEqualTo("/banner/after.jpg");


	}
	
	@Test
	@DisplayName("배너 삭제")
	@Transactional
	@Rollback(false) //CI/CD나 팀 협업시엔 삭제
	void deleteBanner() {
	    EventBanner banner = EventBanner.builder()
	            .imageName("삭제할 배너")
	            .imageUrl("/banner/delete.jpg")
	            .event(testEvent)
	            .build();

	    EventBanner savedBanner = eventBannerRepository.save(banner);
        Long bannerId = savedBanner.getBno();

	    eventBannerRepository.deleteById(savedBanner.getBno());

	    boolean exists = eventBannerRepository.findById(savedBanner.getBno()).isPresent();
	    assertThat(exists).isFalse();
	    
	}
	

}
