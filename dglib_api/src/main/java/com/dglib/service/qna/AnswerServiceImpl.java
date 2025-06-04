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
public class AnswerServiceImpl implements AnswerService {

	private final AnswerRepository answerRepository;
	private final QuestionRepository questionRepository;
	private final MemberRepository memberRepository;

	// 등록
	@Override
	public Long createAnswer(AnswerDTO dto) {
		Member member = memberRepository.findById(dto.getAdminMid())
				.orElseThrow(() -> new IllegalArgumentException("회원 정보 없습니다."));

		Question question = questionRepository.findById(dto.getQno())
				.orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

		Answer answer = Answer.builder()
				.question(question)
				.postedAt(LocalDateTime.now())
				.content(dto.getContent())
				.member(member)
				.build();

		return answerRepository.save(answer).getAno();
	}

	// 조회
	public AnswerDTO getAnswer(Long ano) {
		Answer answer = answerRepository.findById(ano).orElseThrow(() -> new IllegalArgumentException("답변이 없습니다."));

		AnswerDTO dto = new AnswerDTO();
		dto.setAno(answer.getAno());
		dto.setQno(answer.getQuestion().getQno());
		dto.setPostedAt(answer.getPostedAt());
		dto.setContent(answer.getContent());
		dto.setAdminMid(answer.getMember().getMid());

		return dto;

	}

	// 수정
	public void updateAnswer(Long qno, AnswerDTO dto) {
		Question question = questionRepository.findById(qno)
				.orElseThrow(() -> new IllegalArgumentException("해당 질문을 찾을 수 없습니다."));

		Answer answer = question.getAnswer();
		if (answer == null) {
			throw new IllegalStateException("해당 질문에는 아직 답변이 존재하지 않습니다.");
		}

		if (dto.getContent() != null) {
			answer.updateContent(dto.getContent());
		}
		answer.setContent(dto.getContent());
	}

	// 삭제
	public void deleteAnswer(Long ano) {
		Answer answer = answerRepository.findById(ano).orElseThrow(() -> new IllegalArgumentException("답변이 없습니다."));

		answerRepository.delete(answer);
	}

}
