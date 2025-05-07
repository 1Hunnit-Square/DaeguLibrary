package com.dglib.repository;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.Member;
import com.dglib.entity.MemberRole;
import com.dglib.entity.MemberState;
import com.dglib.entity.Answer;
import com.dglib.entity.Question;

@SpringBootTest
public class AnswerRepositoryTest {

	@Autowired
	AnswerRepository answerRepository;
	
	@Autowired
	QuestionRepository questionRepository;
	
	@Autowired
	MemberRepository memberRepository;
	
	Member adminMember, userMember;
	Question question;
	Answer answer;
	
	@BeforeEach
	public void setup() {
		adminMember = Member.builder()
	            .id("admintester")
	            .pw("00000")
	            .name("관리자테스터")
	            .mno(1111)
	            .gender("F")
	            .birthDate(LocalDate.of(2025, 1, 1))
	            .phone("01099999999")
	            .addr("대전시 중구 어쩌구동")
	            .email("testadmin@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .checkTerms(true)
	            .panalty(0)
	            .role(MemberRole.ADMIN)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(adminMember);
	    
	   userMember = Member.builder()
	            .id("tester")
	            .pw("12345")
	            .name("테스터")
	            .mno(1)
	            .gender("F")
	            .birthDate(LocalDate.of(2000, 1, 1))
	            .phone("01012345678")
	            .addr("사랑시 고백구 행복동")
	            .email("test@dglib.com")
	            .checkSms(true)
	            .checkEmail(true)
	            .checkTerms(true)
	            .panalty(0)
	            .role(MemberRole.USER)
	            .state(MemberState.NORMAL)
	            .build();
	    memberRepository.save(userMember);
	    
	    question = Question.builder()
	    		.title("테스트 질문글")
	    		.content("테스트 질문 글")
	    		.checkPublic(false)
	    		.createDate(LocalDate.of(2025, 5, 6))
	    		.viewCount(0)
	    		.member(userMember)
	    		.build();
	    question = questionRepository.save(question);
	    
	}
	
	
	
	@Test
	@DisplayName("답변 글 저장 테스트")
	public void createAnswerTest() {
		    Answer qnaa = Answer.builder()
		    		.qna_q(question)
		    		.content("테스트 답변글 상세 내용")
		    		.createDate(LocalDate.now())
		    		.member(adminMember)
		    		.build();
		    
		Answer saved = answerRepository.save(answer);
		
		System.out.println("답변글 생성, 질문번호: " + saved.getQna_q().getQno());

	}
	
	

	
}
