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

import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.entity.news.News;
import com.dglib.entity.news.NewsImage;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.news.NewsImageRepository;
import com.dglib.repository.news.NewsRepository;

@SpringBootTest
public class NewsRepositoryTest {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private NewsImageRepository newsImageRepository;

    @Autowired
    private MemberRepository memberRepository;

    private Member adminMember;

    @BeforeEach
    public void setup() {
        adminMember = Member.builder()
                .mid("admin")
                .pw("0000")
                .name("관리자")
                .mno("1111")
                .gender("F")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phone("010-1234-5678")
                .addr("대전광역시 서구 둔산동")
                .email("admin@test.com")
                .checkSms(true)
                .checkEmail(true)
                .role(MemberRole.ADMIN)
                .state(MemberState.NORMAL)
                .build();

        memberRepository.save(adminMember);
    }

    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("보도자료 + 이미지 등록 및 조회")
    void createTest() {
        News news = News.builder()
                .title("보도자료 제목")
                .content("보도자료 내용")
                .postedAt(LocalDateTime.now())
                .isPinned(false)
                .isHidden(false)
                .viewCount(0)
                .member(adminMember)
                .build();

        NewsImage image = NewsImage.builder()
                .originalName("news.jpg")
                .filePath("/img/news.jpg")
                .news(news)
                .build();

        news.getImages().add(image);

        News saved = newsRepository.save(news);
        
        News found = newsRepository.findById(saved.getNno()).orElseThrow();
        
        assertThat(found.getTitle()).isEqualTo("보도자료 제목");
        assertThat(saved.getImages()).hasSize(1);
        assertThat(saved.getImages().get(0).getOriginalName()).isEqualTo("news.jpg");
    }


//    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("보도자료 + 이미지 수정")
    void updateTest() {
        News news = News.builder()
                .title("수정 전 제목")
                .content("수정 전 내용")
                .postedAt(LocalDateTime.now())
                .isPinned(false)
                .isHidden(false)
                .viewCount(0)
                .member(adminMember)
                .build();

        NewsImage image = NewsImage.builder()
                .originalName("old.jpg")
                .filePath("/img/old.jpg")
                .news(news)
                .build();

        news.getImages().add(image);
        News saved = newsRepository.save(news);

        // 기존 이미지 제거
        saved.getImages().clear();

        // 새 이미지 추가
        NewsImage newImage = NewsImage.builder()
                .originalName("new.jpg")
                .filePath("/img/new.jpg")
                .news(saved)
                .build();
        saved.getImages().add(newImage);

        saved.setTitle("수정 후 제목");
        saved.setContent("수정 후 내용");

        News updated = newsRepository.save(saved);

        assertThat(updated.getTitle()).isEqualTo("수정 후 제목");
        assertThat(updated.getImages()).hasSize(1);
        assertThat(updated.getImages().get(0).getOriginalName()).isEqualTo("new.jpg");
    }

    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("보도자료 + 이미지 삭제")
    void deleteTest() {
        News news = News.builder()
                .title("삭제 테스트")
                .content("삭제 내용")
                .postedAt(LocalDateTime.now())
                .isPinned(false)
                .isHidden(false)
                .viewCount(0)
                .member(adminMember)
                .build();

        NewsImage image = NewsImage.builder()
                .originalName("delete.jpg")
                .filePath("/img/delete.jpg")
                .news(news)
                .build();

        news.getImages().add(image);
        News saved = newsRepository.save(news);
        Long nno = saved.getNno();

        newsRepository.deleteById(nno);

        boolean exists = newsRepository.findById(nno).isPresent();
        System.out.println("삭제 후 보도자료 존재 여부: " + exists);
        assertThat(exists).isFalse();
    }
}
