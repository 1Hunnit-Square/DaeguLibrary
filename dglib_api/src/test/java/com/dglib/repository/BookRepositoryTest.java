package com.dglib.repository;

import com.dglib.entity.book.Book;
import com.dglib.entity.book.LibraryBook;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.LibraryBookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private LibraryBookRepository libraryBookRepository;

    @Test
    public void testSaveBookAndLibraryBook() {
        
        Book book1 = Book.builder()
                .isbn("9791157540860")
                .bookTitle("신약 어떤 마술의 금서목록 10 - NT Novel")
                .author("카마치 카즈마 (지은이), 하이무라 키요타카 (그림), 김소연 (옮긴이)")
                .publisher("대원씨아이(단행본)")
                .pubDate(LocalDate.of(2014, 10, 15))
                .description("마신 오티누스를 구하기 위해 전 세계를 적으로 돌린 카미조 토우마. 지금까지 든든한 아군이었던 굴지의 권력자, 레벨 5(초능력자), 마술사, 그 모두가 ‘강적’이 되어 카미조 토우마를 덮쳐오는데….")
                .cover("https://image.aladin.co.kr/product/4756/23/cover500/1157540864_1.jpg")
                .build();

        LibraryBook libraryBook1 = LibraryBook.builder()
                .callSign("A123")
                .location("자료실1")
                .book(book1)
                .regLibraryBookDate(LocalDate.of(2025, 5, 01))
                .build();
        
        Book book2 = Book.builder()
                .isbn("9791157102921")
                .bookTitle("전생했더니 슬라임이었던 건에 대하여 6 - S Novel+")
                .author("후세 (지은이), 밋츠바 (그림), 도영명 (옮긴이)")
                .publisher("㈜소미미디어")
                .pubDate(LocalDate.of(2016, 2, 26))
                .description("마왕종으로 진화를 달성한 슬라임――리무루에게 마왕들의 연회, ‘발푸르기스’가 발동되었다는 소식이 날아들었다. 그것은 10명의 마왕이 모두 모이는 특별한 회합. 그것도 그 의제는 마왕을 참칭하는 리무루에 대한 처벌이라고 한다.")
                .cover("https://image.aladin.co.kr/product/7803/1/cover500/k622434224_1.jpg")
                .build();

        LibraryBook libraryBook2 = LibraryBook.builder()
                .callSign("A456")
                .location("자료실1")
                .book(book2)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book3 = Book.builder()
                .isbn("9791136299468")
                .bookTitle("하이큐!! 42 - 무엇")
                .author("후루다테 하루이치 (지은이)")
                .publisher("대원씨아이(만화)")
                .pubDate(LocalDate.of(2020, 7, 7))
                .description("전국대회 예선에 대비해 맹훈련을 실시하는 카라스노 배구부. 하지만 예선의 같은 블록 안에는 아오바조사이, 그리고 인연 깊은 ‘철벽’ 다테공고가 가로막고 있다. 상대가 누구든 눈앞의 일전을 잡기 위해 나간다. 신생 카라스노 배구부, 마침내 출진.")
                .cover("https://image.aladin.co.kr/product/29023/32/cover500/k872836735_1.jpg")
                .build();

        LibraryBook libraryBook3 = LibraryBook.builder()
                .callSign("A789")
                .location("자료실1")
                .book(book3)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book4 = Book.builder()
                .isbn("9788937810794")
                .bookTitle("사막에서 살아남기")
                .author("최덕희 (지은이), 강경효 (그림)")
                .publisher("미래엔아이세움")
                .pubDate(LocalDate.of(2002, 2, 5))
                .description("사하라 사막으로 체험 여행을 떠난 레오 일행은 살인적인 모래 폭풍을 만나 조난을 당한다. 태양이 이글거리는 지옥의 사막에서 레오 일행은 어떻게 탈출할 수 있을까? 극한 상황에서 던져진 주인공들이 어떠한 방법으로 생존해 나가는지 그 과정을 그리면서 그 안에 숨어 있는 과학적 원리들을 재미있는 만화로 그렸다.")
                .cover("https://image.aladin.co.kr/product/32/99/cover500/s562534931_1.jpg")
                .build();

        LibraryBook libraryBook4 = LibraryBook.builder()
                .callSign("B123")
                .location("자료실1")
                .book(book4)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book5 = Book.builder()
                .isbn("9791188870882")
                .bookTitle("더 파이팅 The Fighting 119")
                .author("모리카와 조지 (지은이)")
                .publisher("학산문화사(만화)")
                .pubDate(LocalDate.of(2018, 2, 28))
                .description("나 일보는 한다면 한다. 강하다는 것은 어떤 것일까? 나도 강해지고 싶다. 멍청하고 매일 놀림만 당하는 고교생 일보. 권투선수 마모루와의 만남은 일보의 주먹에 잠재된 다이나마이트 펀치를 잠깨우고 프로복서를 꿈꾸는 일보는 압천도장 입문테스트에 도전할 것인가.")
                .cover("https://image.aladin.co.kr/product/13487/64/cover500/k512532405_1.jpg")
                .build();

        LibraryBook libraryBook5 = LibraryBook.builder()
                .callSign("B456")
                .location("자료실1")
                .book(book5)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book6 = Book.builder()
                .isbn("9788965794622")
                .bookTitle("처음 읽는 초등 그리스 로마 신화 1 - 처음 열린 신들의 세상")
                .author("양태석 (지은이), 조성경 (그림)")
                .publisher("은하수미디어")
                .pubDate(LocalDate.of(2021, 6, 20))
                .description("그리스 로마 신화를 쉽게 재구성하여 어린이도 술술 읽을 수 있게 하였다. 책을 다 읽고 내용을 더 쉽게 이해하고 정보도 얻을 수 있도록 신화 정보와 퀴즈도 수록했다. 신들의 이름과 계보도 정리해서 복잡한 인물 정보를 한눈에 파악할 수 있다.")
                .cover("https://image.aladin.co.kr/product/27495/5/cover500/8965794625_1.jpg")
                .build();

        LibraryBook libraryBook6 = LibraryBook.builder()
                .callSign("B789")
                .location("자료실1")
                .book(book6)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book7 = Book.builder()
                .isbn("9791163033448")
                .bookTitle("Do it! 알고리즘 코딩 테스트 : 자바 편")
                .author("김종관 (지은이)")
                .publisher("이지스퍼블리싱")
                .pubDate(LocalDate.of(2022, 4, 5))
                .description("“코딩 테스트는 어떻게 준비해야 할까?” 곧 코딩 테스트를 앞두고 있거나 올해 안에 IT 기업으로 취업 또는 이직을 준비하고 있다면 누구나 이런 고민을 할 것이다. 《Do it! 알고리즘 코딩 테스트 ? 자바 편》에 그 답이 있다.")
                .cover("https://image.aladin.co.kr/product/29174/36/cover500/k892837576_1.jpg")
                .build();

        LibraryBook libraryBook7 = LibraryBook.builder()
                .callSign("C123")
                .location("자료실2")
                .book(book7)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book8 = Book.builder()
                .isbn("9791162245651")
                .bookTitle("혼자 공부하는 파이썬 - 1:1 과외하듯 배우는 프로그래밍 자습서, 개정판")
                .author("윤인성 (지은이)")
                .publisher("한빛미디어")
                .pubDate(LocalDate.of(2022, 6, 1))
                .description("『혼자 공부하는 파이썬』이 더욱 흥미있고 알찬 내용으로 개정되었다. 프로그래밍이 정말 처음인 입문자도 따라갈 수 있는 친절한 설명과 단계별 학습은 그대로! 혼자 공부하더라도 체계적으로 계획을 세워 학습할 수 있도록 ‘혼공 계획표’를 새롭게 추가했다.")
                .cover("https://image.aladin.co.kr/product/29499/67/cover500/k412837047_1.jpg")
                .build();

        LibraryBook libraryBook8 = LibraryBook.builder()
                .callSign("C456")
                .location("자료실2")
                .book(book8)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book9 = Book.builder()
                .isbn("9791191714425")
                .bookTitle("가시고기")
                .author("조창인 (지은이)")
                .publisher("산지")
                .pubDate(LocalDate.of(2024, 2, 20))
                .description("조창인 소설. 이미 300만 부 이상 팔려 독자들의 사랑을 받은 초베스트셀러이다. 작가는 달라진 시대에 맞는 모습으로 아버지의 숭고한 사랑을 그려내고 싶었고, 일부 내용을 보충하고 수정하여 증보개정판으로 선보이게 되었다.")
                .cover("https://image.aladin.co.kr/product/33603/49/cover500/k152939703_1.jpg")
                .build();

        LibraryBook libraryBook9 = LibraryBook.builder()
                .callSign("C789")
                .location("자료실2")
                .book(book9)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        
        Book book10 = Book.builder()
                .isbn("9788983920690")
                .bookTitle("해리 포터와 마법사의 돌 2 (무선)")
                .author("J.K. 롤링 (지은이), 김혜원 (옮긴이)")
                .publisher("문학수첩")
                .pubDate(LocalDate.of(1999, 11, 19))
                .description("고아 소년 해리 포터가 마법학교에 입학해 마법사의 세계에서 영웅이 되기까지의 무험과 환상이 줄거리. 기본 틀에선 여느 모험소설과 크게 틀리지 않지만, 절묘하게 인용되는 신화의 교훈, 악과 맞서 당당하게 싸우게 하는 도덕적 덕목, 영상세대 다운 생생한 비쥬얼리티의 도입 등 재미와 품격을 두루 갖춘 걸작이라 해도 손색이 없다. -한국일보")
                .cover("https://image.aladin.co.kr/product/21/6/cover500/8983920696_2.jpg")
                .build();

        LibraryBook libraryBook10 = LibraryBook.builder()
                .callSign("D123")
                .location("자료실2")
                .book(book10)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        LibraryBook libraryBook11 = LibraryBook.builder()
                .callSign("D456")
                .location("자료실2")
                .book(book1)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        LibraryBook libraryBook12 = LibraryBook.builder()
                .callSign("D789")
                .location("자료실2")
                .book(book2)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        LibraryBook libraryBook13 = LibraryBook.builder()
                .callSign("E123")
                .location("자료실2")
                .book(book1)
                .regLibraryBookDate(LocalDate.of(2025, 5, 02))
                .build();
        bookRepository.saveAll(List.of(book1, book2, book3, book4, book5, book6, book7, book8, book9, book10));
        libraryBookRepository.saveAll(List.of(libraryBook1, libraryBook2, libraryBook3, libraryBook4, libraryBook5, libraryBook6, libraryBook7, libraryBook8, libraryBook9, libraryBook10, libraryBook11, libraryBook12, libraryBook13));
        
        

 
        List<Book> books = bookRepository.findAll();
        List<LibraryBook> libraryBooks = libraryBookRepository.findAll();

        assertThat(books).hasSizeGreaterThanOrEqualTo(2);
        assertThat(libraryBooks).hasSizeGreaterThanOrEqualTo(2);
    }
}
