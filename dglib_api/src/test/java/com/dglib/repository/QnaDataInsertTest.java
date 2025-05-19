package com.dglib.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.member.Member;
import com.dglib.entity.qna.Answer;
import com.dglib.entity.qna.Question;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.qna.AnswerRepository;
import com.dglib.repository.qna.QuestionRepository;

@SpringBootTest
public class QnaDataInsertTest {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    private final Random random = new Random();

    @Test
    @DisplayName("무작위 공개/비공개 질문 14개 + 무작위 답변 7개 입력")
    public void insertQuestionsAndAnswers() {

        Member user1 = memberRepository.findById("user1")
                .orElseThrow(() -> new RuntimeException("user1 없음"));
        Member user2 = memberRepository.findById("user2")
                .orElseThrow(() -> new RuntimeException("user2 없음"));

        List<Long> questionIds = new ArrayList<>();

        // user1 질문 7개
        for (int i = 1; i <= 7; i++) {
            Question q = Question.builder()
                    .title("user1 질문 제목 " + i)
                    .content("user1 질문 내용 " + i)
                    .checkPublic(random.nextBoolean()) // 무작위 공개 여부
                    .postedAt(LocalDateTime.now())
                    .viewCount(0)
                    .member(user1)
                    .build();
            questionRepository.save(q);
            questionIds.add(q.getQno());
        }

        // user2 질문 7개
        for (int i = 1; i <= 7; i++) {
            Question q = Question.builder()
                    .title("user2 질문 제목 " + i)
                    .content("user2 질문 내용 " + i)
                    .checkPublic(random.nextBoolean()) // 무작위 공개 여부
                    .postedAt(LocalDateTime.now())
                    .viewCount(0)
                    .member(user2)
                    .build();
            questionRepository.save(q);
            questionIds.add(q.getQno());
        }

        // 무작위 질문 7개에 대해 user2가 답변 작성
        Collections.shuffle(questionIds);
        for (int i = 0; i < 7; i++) {
            Long qno = questionIds.get(i);
            Question question = questionRepository.findById(qno)
                    .orElseThrow(() -> new RuntimeException("질문 없음: " + qno));
            Answer answer = Answer.builder()
                    .question(question)
                    .content("답변 내용입니다. (qno: " + qno + ")")
                    .postedAt(LocalDateTime.now())
                    .member(user2)
                    .build();
            answerRepository.save(answer);
        }

        System.out.println("성공적 저장");
    }
}
