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
import com.dglib.security.jwt.JwtFilter;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class AnswerServiceImpl implements AnswerService {

	private final AnswerRepository answerRepository;
	private final QuestionRepository questionRepository;
	private final MemberRepository memberRepository;
	private final EntityManager em;

	// 등록
	@Override
	public Long createAnswer(AnswerDTO dto) {
		Member member = memberRepository.findById(dto.getAdminMid())
				.orElseThrow(() -> new IllegalArgumentException("회원 정보 없습니다."));

		if (!"ROLE_ADMIN".equals(JwtFilter.getRoleName())) {
			throw new IllegalArgumentException("작성 권한이 없습니다.");
		}

		Question question = questionRepository.findById(dto.getQno())
				.orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

		Answer answer = Answer.builder().question(question).postedAt(LocalDateTime.now()).content(dto.getContent())
				.member(member).build();

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
	@Override
	public void updateAnswer(Long qno, AnswerDTO dto) {

		Member member = memberRepository.findById(dto.getAdminMid())
				.orElseThrow(() -> new IllegalArgumentException("회원 정보 없습니다."));

		Answer answer = answerRepository.findByQuestion_Qno(qno)
				.orElseThrow(() -> new RuntimeException("답변이 존재하지 않습니다."));

		if (!JwtFilter.checkAuth(answer.getMember().getMid())) {
			throw new IllegalArgumentException("수정 권한이 없습니다.");
		}

		answer.setContent(dto.getContent());
		answer.setModifiedAt(LocalDateTime.now());

		answerRepository.save(answer);
	}

	// 삭제
	public void deleteAnswer(Long ano, String requesterMid) {
		Answer answer = answerRepository.findById(ano).orElseThrow(() -> new IllegalArgumentException("답변이 없습니다."));

		System.out.println(">> 삭제 요청자: " + requesterMid);
		System.out.println(">> 실제 작성자: " + answer.getMember().getMid());

		if (!JwtFilter.checkAuth(null)) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		// 양방향 관계 끊기
		Question question = answer.getQuestion();
		question.setAnswer(null); // Answer 제거
		answer.setQuestion(null); // 반대편도 끊기

		questionRepository.save(question);

		System.out.println(">> 삭제 완료");
	}

}
