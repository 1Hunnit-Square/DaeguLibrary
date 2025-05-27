package com.dglib.service.qna;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.dglib.dto.qna.AnswerDTO;
import com.dglib.dto.qna.QuestionDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.QuestionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final MemberRepository memberRepository;

    // 등록
    @Override
    public Long createQuestion(QuestionDTO dto) {
        Member member = memberRepository.findById(dto.getMemberMid())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보가 없습니다."));

        Question question = Question.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .checkPublic(dto.getCheckPublic())
                .postedAt(LocalDateTime.now())
                .member(member)
                .build();

        return questionRepository.save(question).getQno();
    }

    // 상세 조회
    @Override
    public QuestionDTO getQuestion(Long qno, String requesterMid) {
        Question question = questionRepository.findById(qno)
                .orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

        boolean isWriter = question.getMember().getMid().equals(requesterMid);
        boolean isPublic = question.isCheckPublic();

        if (!isWriter && !isPublic) {
        	System.out.println("질문을 가져올 수 없음");
            throw new AccessDeniedException("비공개 글은 작성자만 볼 수 있습니다.");
        }

        question.setViewCount(question.getViewCount() + 1);

        QuestionDTO dto = new QuestionDTO();
        dto.setQno(question.getQno());
        dto.setTitle(question.getTitle());
        dto.setContent(question.getContent());
        dto.setCheckPublic(question.isCheckPublic());
        dto.setPostedAt(question.getPostedAt());
        dto.setModifiedAt(question.getModifiedAt());
        dto.setViewCount(question.getViewCount());
        dto.setWriterId(question.getMember().getMid());
        dto.setWriterName(question.getMember().getName());

        if (question.getAnswer() != null) {
            AnswerDTO answerDto = new AnswerDTO();
            answerDto.setAno(question.getAnswer().getAno());
            answerDto.setQno(question.getQno());
            answerDto.setPostedAt(question.getAnswer().getPostedAt());
            answerDto.setModifiedAt(question.getAnswer().getModifiedAt());
            answerDto.setContent(question.getAnswer().getContent());
            answerDto.setMemberMid(question.getAnswer().getMember().getMid());

            dto.setAnswer(answerDto);
        }

        return dto;
    }

    // 전체 목록 조회
    @Override
    public Page<QuestionDTO> getQuestionsWithStatus(Pageable pageable, String requesterMid) {
        return questionRepository.findAll(pageable)
                .map(question -> {
                    QuestionDTO dto = new QuestionDTO();
                    dto.setQno(question.getQno());
                    dto.setTitle(question.getTitle());
                    dto.setCheckPublic(question.isCheckPublic());
                    dto.setPostedAt(question.getPostedAt());
                    dto.setModifiedAt(question.getModifiedAt());
                    dto.setViewCount(question.getViewCount());

                    String writerId = question.getMember().getMid();
                    String writerName = question.getMember().getName();

                    dto.setWriterId(writerId);
                    dto.setWriterName(
                            question.isCheckPublic() || writerId.equals(requesterMid)
                                    ? writerName
                                    : "*".repeat(writerName.length()));
                    dto.setStatus(question.getAnswer() == null ? "접수" : "완료");

                    return dto;
                });
    }

    // 조건 검색 포함 조회
    @Override
    public Page<QuestionDTO> getQuestionsWithSpecification(Specification<Question> spec, Pageable pageable,
            String requesterMid) {
        return questionRepository.findAll(spec, pageable)
                .map(question -> {
                    QuestionDTO dto = new QuestionDTO();
                    dto.setQno(question.getQno());
                    dto.setTitle(question.getTitle());
                    dto.setCheckPublic(question.isCheckPublic());
                    dto.setPostedAt(question.getPostedAt());
                    dto.setModifiedAt(question.getModifiedAt());
                    dto.setViewCount(question.getViewCount());

                    String writerId = question.getMember().getMid();
                    String writerName = question.getMember().getName();

                    dto.setWriterId(writerId);
                    dto.setWriterName(
                            question.isCheckPublic() || writerId.equals(requesterMid)
                                    ? writerName
                                    : "*".repeat(writerName.length()));
                    dto.setContent(
                            question.isCheckPublic() || writerId.equals(requesterMid)
                                    ? question.getContent()
                                    : null);
                    dto.setStatus(question.getAnswer() == null ? "접수" : "완료");

                    return dto;
                });
    }

    // 수정
    @Override
    public void updateQuestion(Long qno, QuestionDTO dto) {
        Question question = questionRepository.findById(qno)
                .orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

        if (!question.getMember().getMid().equals(dto.getMemberMid())) {
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
    }

    // 삭제
    @Override
    public void deleteQuestion(Long qno, String requesterMid) {
        Question question = questionRepository.findById(qno)
                .orElseThrow(() -> new IllegalArgumentException("찾으시는 질문이 없습니다."));

        if (!question.getMember().getMid().equals(requesterMid)) {
            throw new IllegalAccessError("작성자만 삭제 가능합니다.");
        }

        questionRepository.delete(question);
    }
}
