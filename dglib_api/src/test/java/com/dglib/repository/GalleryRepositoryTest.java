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

import com.dglib.entity.gallery.Gallery;
import com.dglib.entity.gallery.GalleryImage;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.gallery.GalleryImageRepository;
import com.dglib.repository.gallery.GalleryRepository;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Log4j2
public class GalleryRepositoryTest {
	
    @Autowired
    private GalleryRepository galleryRepository;

    @Autowired
    private GalleryImageRepository galleryImageRepository;

    private Member adminMember;

    @BeforeEach
    void setup() {
        this.adminMember = Member.builder()
                .mid("admin")
                .pw("1234")
                .name("관리자")
                .mno("001")
                .gender("F")
                .birthDate(LocalDate.of(1990, 1, 1))
                .phone("010-0000-0000")
                .addr("대전광역시 중구")
                .email("admin@dg.com")
                .checkSms(true)
                .checkEmail(true)
                .role(MemberRole.ADMIN)
                .state(MemberState.NORMAL)
                .build();
    }

//    @Test
    @DisplayName("갤러리 등록 테스트")
    @Rollback(false)
    @Transactional
    void testCreateGallery() {
        Gallery gallery = Gallery.builder()
                .title("갤러리 등록")
                .content("갤러리 내용입니다.")
                .member(adminMember)
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .build();

        GalleryImage image = GalleryImage.builder()
                .originalName("sample.jpg")
                .filePath("/img/sample.jpg")
                .gallery(gallery)
                .build();

        gallery.getImages().add(image);
        Gallery saved = galleryRepository.save(gallery);

        assertThat(saved.getImages()).hasSize(1);
        assertThat(saved.getImages().get(0).getOriginalName()).isEqualTo("sample.jpg");
    }

//    @Test
    @DisplayName("갤러리 조회 테스트")
    @Rollback(false)
    @Transactional
    void testReadGallery() {
        Gallery gallery = Gallery.builder()
                .title("조회 테스트")
                .content("조회 내용입니다.")
                .member(adminMember)
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .build();

        GalleryImage image = GalleryImage.builder()
                .originalName("read.jpg")
                .filePath("/img/read.jpg")
                .gallery(gallery)
                .build();

        gallery.getImages().add(image);
        Gallery saved = galleryRepository.save(gallery);

        Gallery found = galleryRepository.findById(saved.getGno()).orElseThrow();
        assertThat(found.getTitle()).isEqualTo("조회 테스트");
        assertThat(found.getImages()).hasSize(1);
    }

//    @Test
    @DisplayName("갤러리 수정 테스트")
    @Rollback(false)
    @Transactional
    void testUpdateGallery() {
        Gallery gallery = Gallery.builder()
                .title("수정 전 제목")
                .content("수정 전 내용")
                .member(adminMember)
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .build();

        GalleryImage image = GalleryImage.builder()
                .originalName("old.jpg")
                .filePath("/img/old.jpg")
                .gallery(gallery)
                .build();

        gallery.getImages().add(image);
        Gallery saved = galleryRepository.save(gallery);

        // 기존 이미지 제거
        saved.getImages().clear();

        // 새 이미지 추가
        GalleryImage newImage = GalleryImage.builder()
                .originalName("new.jpg")
                .filePath("/img/new.jpg")
                .gallery(saved)
                .build();
        saved.getImages().add(newImage);

        // 내용 수정
        saved.setTitle("수정 후 제목");
        saved.setContent("수정 후 내용");

        Gallery updated = galleryRepository.save(saved);

        assertThat(updated.getTitle()).isEqualTo("수정 후 제목");
        assertThat(updated.getImages()).hasSize(1);
        assertThat(updated.getImages().get(0).getOriginalName()).isEqualTo("new.jpg");
    }

    @Test
    @DisplayName("갤러리 삭제 테스트")
    @Rollback(false)
    @Transactional
    void testDeleteGallery() {
        Gallery gallery = Gallery.builder()
                .title("삭제 테스트")
                .content("삭제 테스트 내용")
                .member(adminMember)
                .postedAt(LocalDateTime.now())
                .viewCount(0)
                .build();

        GalleryImage image = GalleryImage.builder()
                .originalName("delete.jpg")
                .filePath("/img/delete.jpg")
                .gallery(gallery)
                .build();

        gallery.getImages().add(image);
        Gallery saved = galleryRepository.save(gallery);
        Long gno = saved.getGno();

        // 삭제
        galleryRepository.deleteById(gno);

        boolean exists = galleryRepository.findById(gno).isPresent();
        System.out.println("삭제 후 존재 여부: " + exists);
        assertThat(exists).isFalse();
    }	

}