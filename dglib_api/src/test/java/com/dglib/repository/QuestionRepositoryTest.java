package com.dglib.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.QuestionRepository;

@SpringBootTest
public class QuestionRepositoryTest {

	@Autowired
	QuestionRepository questionRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
	
	Member testMember;
	
	Question question;
	
	@BeforeEach
	public void setup() {
		testMember = Member.builder()
	            .mid("tester")
	            .pw("12345")
	            .name("테스터")
	            .mno("1")
	            .gender("F")
	            .birthDate(LocalDate.of(2000, 1, 1))
	            .phone("01012345678")
	            .addr("사랑시 고백구 행복동")
	            .email("test@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .role(MemberRole.USER)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(testMember);
	    
	    question = Question.builder()
	    		.title("테스트글")
	    		.content("테스트글 상세 내용입니다.")
	    		.checkPublic(true)
	    		.postedAt(LocalDateTime.now())
	    		.viewCount(0)
	    		.member(testMember)
	    		.build();
	    question = questionRepository.save(question);
	}
	
	
//	@Test
	@DisplayName("질문글 조회 테스트")
	public void findQuestionTest() {
		long qno = question.getQno();
		
		Question find = questionRepository.findById(qno).orElseThrow(() -> new RuntimeException("질문글을 찾을 수 없습니다."));
		
		System.out.println("조회한 제목: " + find.getTitle());
	    System.out.println("조회한 내용: " + find.getContent());
	    System.out.println("작성자: " + find.getMember().getName());
		
	}
	
	
	
//	@Test
	@DisplayName("질문글 수정 테스트")
	public void modifyQuestionTest() {
		Question saved = questionRepository.save(question);
		
		saved.updateTitle("제목 수정");
		saved.updateContent("내용 수정");
		
		Question updated = questionRepository.save(saved);
		
		System.out.println("수정한 제목: " + updated.getTitle());
		System.out.println("수정한 내용: " + updated.getContent());
		System.out.println("수정일: " + updated.getModifiedAt());
	}
	
	
	@Test
	@DisplayName("질문글 삭제 테스트")
	public void deleteQuestionTest() {
		long qno = question.getQno();
		
		questionRepository.deleteById(qno);
		
		boolean exist = questionRepository.findById(qno).isPresent();
		System.out.println("글 삭제 결과: " + exist);
		}
	

	
}
