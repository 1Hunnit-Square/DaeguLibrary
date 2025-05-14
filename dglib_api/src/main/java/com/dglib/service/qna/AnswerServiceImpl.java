package com.dglib.service.qna;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.dglib.dto.qna.AnswerDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.qna.Answer;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.AnswerRepository;
import com.dglib.repository.qna.QuestionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class AnswerServiceImpl implements AnswerService	{

	
	private final AnswerRepository answerRepository;
	private final QuestionRepository questionRepository;
	private final MemberRepository memberRepository;
	
	//등록
	@Override
	public Long createAnswer(AnswerDTO dto) {
		Member member = memberRepository.findById(dto.getMemberMid())
				.orElseThrow(() -> new IllegalArgumentException("회원 정보 없음"));
		
		Question question = questionRepository.findById(dto.getQno())
				.orElseThrow(() -> new IllegalArgumentException("답변할 질문글 없음"));
		
		Answer answer = Answer.builder()
				.question(question)
				.postedAt(LocalDateTime.now())
				.modifiedAt(LocalDateTime.now())
				.content(dto.getContent())
				.member(member)
				.build();
		
		return answerRepository.save(answer).getAno();
	}

	//조회
	public AnswerDTO getAnswer(Long ano) {
		Answer answer = answerRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("답변 없음"));
		
		
		AnswerDTO dto = new AnswerDTO();
		dto.setAno(answer.getAno());
		dto.setQno(answer.getQuestion().getQno());
		dto.setPostedAt(answer.getPostedAt());
		dto.setModifiedAt(answer.getModifiedAt());
		dto.setContent(answer.getContent());
		dto.setMemberMid(answer.getMember().getMid());
		
		return dto;
		
	}

	//수정
	public void updateAnswer(Long ano, AnswerDTO dto) {
		Answer answer = answerRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("답변 없음"));
		
		if(dto.getContent() != null) {
			answer.updateContent(dto.getContent());
		}
		
	}

	
	//삭제
	public void deleteAnswer(Long ano) {
		Answer answer = answerRepository.findById(ano)
				.orElseThrow(() -> new IllegalArgumentException("답변 없음"));
		
		answerRepository.delete(answer);
	}
	
}
