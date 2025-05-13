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
import com.dglib.entity.qna.Answer;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.AnswerRepository;
import com.dglib.repository.qna.QuestionRepository;

@SpringBootTest
public class AnswerRepositoryTest {

	@Autowired
	AnswerRepository answerRepository;
	
	@Autowired
	QuestionRepository questionRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
	Member adminMember, userMember;
	Question questionEntity;
	Answer answer;
	
	@BeforeEach
	public void setup() {
		adminMember = Member.builder()
	            .mid("admintester")
	            .pw("00000")
	            .name("관리자테스터")
	            .mno("1111")
	            .gender("F")
	            .birthDate(LocalDate.of(2025, 1, 1))
	            .phone("01099999999")
	            .addr("대전시 중구 어쩌구동")
	            .email("testadmin@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .role(MemberRole.ADMIN)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(adminMember);
	    
	    userMember = Member.builder()
	            .mid("usertester")
	            .pw("12345")
	            .name("회원테스터")
	            .mno("1")
	            .gender("M")
	            .birthDate(LocalDate.of(2000, 1, 1))
	            .phone("01012345678")
	            .addr("사랑시 고백구 행복동")
	            .email("test@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .role(MemberRole.USER)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(userMember);
	    
	    questionEntity = Question.builder()
	    		.title("테스트 질문글")
	    		.content("테스트 질문글 상세 내용")
	    		.checkPublic(false)
	    		.postedAt(LocalDateTime.of(2025, 5, 6, 17, 30))
	    		.viewCount(0)
	    		.member(userMember)
	    		.build();
	    questionEntity = questionRepository.save(questionEntity);
	    
	    answer = Answer.builder()
	    		.question(questionEntity)
	    		.postedAt(LocalDateTime.now())
	    		.content("관리자 답변 글 테스트")
	    		.member(adminMember)
	    		.build();
	    answer = answerRepository.save(answer);
	    
	}
	
	
	
	@Test
	@DisplayName("답변 글 저장 테스트")
	public void createAnswerTest() {
		    Answer answer = Answer.builder()
		    		.question(questionEntity)
		    		.content("테스트 답변글 상세 내용")
		    		.postedAt(LocalDateTime.now())
		    		.member(adminMember)
		    		.build();
		    
		Answer saved = answerRepository.save(answer);
		
		System.out.println("답변글 생성, 질문번호: " + saved.getQuestion().getQno());
	}
	
	@Test
	@DisplayName("답변 글 조회 테스트")
	public void findAnswerTest() {
		long ano = answer.getAno();
		long qno = questionEntity.getQno();
		
		Answer Afind = answerRepository.findById(ano).orElseThrow(() -> new RuntimeException("답변글을 찾을 수 없음"));
		Question Qfind = questionRepository.findById(qno).orElseThrow(() -> new RuntimeException("질물글을 찾을 수 없음"));
		System.out.println("조회한 질문글 제목: " + Qfind.getTitle());
	    System.out.println("조회한 질문글 내용: " + Qfind.getContent());
	    System.out.println("조회한 답변글 내용: " + Afind.getContent());
	    System.out.println("답변글 작성자: " + Afind.getMember().getName());
	}
	
	@Test
	@DisplayName("답변 글 수정 테스트")
	public void modifyAnswerTest() {
		Answer saved = answerRepository.save(answer);
		
		saved.updateContent("답변 글 내용 수정");
		Answer updated = answerRepository.save(saved);
		
		System.out.println("수정한 내용: " + updated.getContent());
		System.out.println("수정일: " + updated.getModifiedAt());
	}
	
	@Test
	@DisplayName("답변 글 삭제 테스트")
	public void deleteAnswerTest() {
		long ano = answer.getAno();
		
		answerRepository.deleteById(ano);
		
		boolean exist = answerRepository.findById(ano).isPresent();
		System.out.println("답변 글 삭제 결과: " + exist);
	}
	
	
}
