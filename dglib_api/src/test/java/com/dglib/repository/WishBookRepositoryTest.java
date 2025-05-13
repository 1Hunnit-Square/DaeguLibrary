package com.dglib.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.Member;
import com.dglib.entity.MemberRole;
import com.dglib.entity.MemberState;
import com.dglib.entity.wishBook.WishBook;
import com.dglib.repository.wishBook.WishBookRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class WishBookRepositoryTest {

    @Autowired
    private WishBookRepository wishBookRepository;

    @Autowired
    private MemberRepository memberRepository;

    
//    @Test
    @DisplayName("희망 도서 신청")
    public void createWishBook() {
        Member member = Member.builder()
                .mid("0123456789123456")
                .pw("1234")
                .name("테스터")
                .mno("001")
                .gender("F")
                .birthDate(LocalDate.of(2000, 1, 1))
                .phone("01012345678")
                .addr("대구광역시")
                .email("tester@example.com")
                .checkSms(true)
                .checkEmail(true)
                .checkTerms(true)
                .penalty(0)
                .role(MemberRole.USER)
                .state(MemberState.NORMAL)
                .build();

        memberRepository.save(member);

        WishBook wishBook = WishBook.builder()
                .bookTitle("테스트 책 제목")
                .author("김선생")
                .publisher("테스트출판사")
                .isbn("1234567890123")
                .note("비고입니다.")
                .state("신청중")
                .appliedAt(LocalDateTime.of(2025, 5, 13, 14, 0))
                .member(member)
                .build();

        WishBook saved = wishBookRepository.save(wishBook);
        System.out.println("신청 시간: " + saved.getAppliedAt());
    }

//    @Test
    @DisplayName("희망 도서 조회")
    public void findWishBook() {
        List<WishBook> list = wishBookRepository.findAll();

        for (WishBook use : list) {
            System.out.println("책제목: " + use.getBookTitle());
            System.out.println("저자: " + use.getAuthor());
            System.out.println("출판사: " + use.getPublisher());
            System.out.println("ISBN: " + use.getIsbn());
            System.out.println("--------");
        }
    }
    
    
    @Test
    @DisplayName("희망 도서 신청 삭제")
	public void deleteProgramUseTest() {
	    Long wishNo = 1L;

	    boolean exists = wishBookRepository.existsById(wishNo);
	    if (exists) {
	    	wishBookRepository.deleteById(wishNo);
	        System.out.println("신청번호 " + wishNo + " 삭제 완료");
	    } else {
	        System.out.println("신청번호 " + wishNo + " 는 존재하지 않습니다.");
	    }
	} 
}
