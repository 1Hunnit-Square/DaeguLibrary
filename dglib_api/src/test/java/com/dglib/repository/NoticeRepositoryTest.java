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
import com.dglib.entity.notice.Notice;
import com.dglib.entity.notice.NoticeFile;
import com.dglib.repository.member.MemberRepository;
import com.dglib.repository.notice.NoticeFileRepository;
import com.dglib.repository.notice.NoticeRepository;

@SpringBootTest
public class NoticeRepositoryTest {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NoticeFileRepository noticeFileRepository;

    @Autowired
    private MemberRepository memberRepository;

    private Member adminMember;

    @BeforeEach
    public void setup() {
        this.adminMember = Member.builder()
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

//    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("공지사항 + 첨부파일 등록")
    void createTest() {
        Notice notice = Notice.builder()
                .title("등록 테스트")
                .content("등록 테스트 내용")
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .isHidden(false)
                .isPinned(false)
                .member(adminMember)
                .build();

        NoticeFile file = NoticeFile.builder()
                .originalName("test.pdf")
                .filePath("/files/test.pdf")
                .fileType("pdf")
                .notice(notice)
                .build();

        notice.getFiles().add(file);
        Notice saved = noticeRepository.save(notice);

        assertThat(saved.getFiles()).hasSize(1);
        assertThat(saved.getFiles().get(0).getOriginalName()).isEqualTo("test.pdf");
    }

//    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("공지사항 + 첨부파일 조회")
    void readTest() {
        Notice notice = Notice.builder()
                .title("조회 테스트")
                .content("조회 테스트 내용")
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .isHidden(false)
                .isPinned(false)
                .member(adminMember)
                .build();

        NoticeFile file = NoticeFile.builder()
                .originalName("read.pdf")
                .filePath("/files/read.pdf")
                .fileType("pdf")
                .notice(notice)
                .build();

        notice.getFiles().add(file);
        Notice saved = noticeRepository.save(notice);

        Notice found = noticeRepository.findById(saved.getAno()).orElseThrow();
        assertThat(found.getTitle()).isEqualTo("조회 테스트");
        assertThat(found.getFiles()).hasSize(1);
    }

//    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("공지사항 + 첨부파일 수정")
    void updateTest() {
        Notice notice = Notice.builder()
                .title("수정 전 제목")
                .content("수정 전 내용")
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .isHidden(false)
                .isPinned(false)
                .member(adminMember)
                .build();

        NoticeFile file = NoticeFile.builder()
                .originalName("old.pdf")
                .filePath("/files/old.pdf")
                .fileType("pdf")
                .notice(notice)
                .build();

        notice.getFiles().add(file);
        Notice saved = noticeRepository.save(notice);

        // 기존 파일 제거
        saved.getFiles().clear();

        // 새 파일 추가
        NoticeFile newFile = NoticeFile.builder()
                .originalName("new.pdf")
                .filePath("/files/new.pdf")
                .fileType("pdf")
                .notice(saved)
                .build();
        saved.getFiles().add(newFile);

        // 제목과 내용 수정
        saved.setTitle("수정 후 제목");
        saved.setContent("수정 후 내용");

        Notice updated = noticeRepository.save(saved);

        assertThat(updated.getTitle()).isEqualTo("수정 후 제목");
        assertThat(updated.getFiles()).hasSize(1);
        assertThat(updated.getFiles().get(0).getOriginalName()).isEqualTo("new.pdf");
    }

    @Test
    @Transactional
    @Rollback(false)
    @DisplayName("공지사항 및 첨부파일 삭제")
    void deleteTest() {
        // 공지사항 및 첨부파일 생성
        Notice notice = Notice.builder()
                .title("삭제 테스트")
                .content("삭제 테스트 내용")
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .isHidden(false)
                .isPinned(false)
                .member(adminMember)
                .build();

        NoticeFile file = NoticeFile.builder()
                .originalName("delete.pdf")
                .filePath("/files/delete.pdf")
                .fileType("pdf")
                .notice(notice)
                .build();

        notice.getFiles().add(file);
        Notice saved = noticeRepository.save(notice);
        Long ano = saved.getAno();
        Long fno = saved.getFiles().get(0).getFno(); //첨부파일 번호

        //삭제
        noticeRepository.deleteById(ano);
       

        //검증 및 결과 출력
        boolean noticeExists = noticeRepository.findById(ano).isPresent();
        boolean fileExists = noticeFileRepository.findById(fno).isPresent();
        System.out.println("삭제 후 공지사항 존재 여부: " + noticeExists);
        System.out.println("삭제 후 첨부파일 존재 여부: " + fileExists);
        
        assertThat(noticeExists).isFalse();
    }
}
