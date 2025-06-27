package com.dglib.service.qna;

import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.dglib.dto.qna.AnswerDTO;
import com.dglib.dto.qna.QuestionDetailDTO;
import com.dglib.dto.qna.QuestionListDTO;
import com.dglib.dto.qna.QuestionNewDTO;
import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.dto.qna.QuestionUpdateDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.QuestionRepository;
import com.dglib.repository.qna.QuestionSpecifications;
import com.dglib.security.jwt.JwtFilter;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

	private final QuestionRepository questionRepository;
	private final MemberRepository memberRepository;
	private final ModelMapper modelMapper;

	// 등록
	@Override
	public Long newQuestion(QuestionNewDTO newDTO) {
		Member member = memberRepository.findById(newDTO.getMemberMid())
				.orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

		Question question = modelMapper.map(newDTO, Question.class);
		question.setMember(member);
		question.setPostedAt(LocalDateTime.now());

		return questionRepository.save(question).getQno();

	}

	// 목록 및 검색
	@Override
	public Page<QuestionListDTO> findAll(QuestionSearchDTO searchDTO, Pageable pageable, String requesterMid) {
		Specification<Question> spec = QuestionSpecifications.fromDTO(searchDTO);
		Page<Question> questionList = questionRepository.findAll(spec, pageable);

		Page<QuestionListDTO> result = questionList.map(question -> {
			QuestionListDTO questionListDTO = new QuestionListDTO();
			modelMapper.map(question, questionListDTO);

			String writerMid = question.getMember().getMid();
			String writerName = question.getMember().getName();

			boolean isOwner = requesterMid != null && writerMid.equals(requesterMid);
			boolean isPublic = question.isCheckPublic();

			questionListDTO.setStatus(question.getAnswer() == null ? "접수" : "완료");
			questionListDTO.setName(isPublic || isOwner ? writerName : "*".repeat(writerName.length()));
			return questionListDTO;
		});
		return result;
	}

	// 상세 보기
	@Override
	public QuestionDetailDTO getQuestion(Long qno, String requesterMid) {
		Question question = questionRepository.findById(qno)
				.orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

		String writerMid = question.getMember().getMid();
//		boolean isOwner = requesterMid != null && writerMid.equals(requesterMid);
		boolean isPublic = question.isCheckPublic();
		boolean hasAuth = JwtFilter.checkMember(writerMid, isPublic);

		if (!hasAuth) {
		    System.out.println("질문을 가져올 수 없음");
		    throw new IllegalArgumentException("Not Access Question");
		}
		question.setViewCount(question.getViewCount() + 1);

		QuestionDetailDTO dto = modelMapper.map(question, QuestionDetailDTO.class);
		dto.setName(question.getMember().getName());
		dto.setWriterMid(question.getMember().getMid());

		if (question.getAnswer() != null) {
			AnswerDTO answerDto = modelMapper.map(question.getAnswer(), AnswerDTO.class);
			dto.setAnswer(answerDto);
		}

		return dto;
	}

	// 수정
	@Override
	public void update(Long qno, QuestionUpdateDTO dto) {
		Question question = questionRepository.findById(qno)
				.orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

		if (!question.getMember().getMid().equals(dto.getWriterMid())) {
			throw new IllegalAccessError("작성자만 수정 가능합니다.");
		}

		if (dto.getTitle() != null) {
			if (!StringUtils.hasText(dto.getTitle())) {
				throw new IllegalArgumentException("제목은 공백일 수 없습니다.");
			}
			question.updateTitle(dto.getTitle());
		}

		if (dto.getContent() != null) {
			if (!StringUtils.hasText(dto.getContent())) {
				throw new IllegalArgumentException("내용은 공백일 수 없습니다.");
			}
			question.updateContent(dto.getContent());
		}

		if (dto.getCheckPublic() != null) {
			question.updateCheckPublic(dto.getCheckPublic());
		} else {
			throw new IllegalArgumentException("공개여부는 반드시 선택해야 합니다.");
		}

		System.out.println("수정 요청 도착");
	}

	// 삭제
	@Override
	public void delete(Long qno, String requesterMid) {
		Question question = questionRepository.findById(qno)
				.orElseThrow(() -> new IllegalArgumentException("해당 질문이 존재하지 않습니다."));

		String writerMid = question.getMember().getMid();
		boolean hasAuth = JwtFilter.checkAuth(writerMid);
		
		if (!hasAuth) {
			throw new IllegalArgumentException("삭제 권한이 없습니다.");
		}

		questionRepository.delete(question);
	}

}
