package com.dglib.repository;

import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.Member;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.member.MemberRepository;

@SpringBootTest
public class RentalRepositoryTest {

    @Autowired
    RentalRepository rentalRepository;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    LibraryBookRepository libraryBookRepository;

    @Test
    public void testSaveAndReturnAllRentalsByYearAndMonth() {
        Member member = memberRepository.findById("kdh3502")
                .orElseThrow(() -> new RuntimeException("Member not found"));

        LibraryBook libraryBook = libraryBookRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("LibraryBook not found"));

        for (int year = 2015; year <= 2024; year++) {
            for (int month = 1; month <= 12; month++) {
                int count = ThreadLocalRandom.current().nextInt(10, 21); 
                saveMonthlyRentals(member, libraryBook, year, month, count);
            }
        }
    }

    private void saveMonthlyRentals(Member member, LibraryBook libraryBook, int year, int month, int count) {
        LocalDate baseDate = LocalDate.of(year, month, 1);
        int daysInMonth = baseDate.lengthOfMonth();

        for (int i = 0; i < count; i++) {
            int randomDay = ThreadLocalRandom.current().nextInt(1, daysInMonth + 1);
            LocalDate rentStartDate = LocalDate.of(year, month, randomDay);

            if (!rentStartDate.isAfter(LocalDate.now())) {
                LocalDate dueDate = rentStartDate.plusDays(7);
                LocalDate returnDate = rentStartDate.plusDays(3);

                Rental rental = Rental.builder()
                        .member(member)
                        .libraryBook(libraryBook)
                        .rentStartDate(rentStartDate)
                        .dueDate(dueDate)
                        .returnDate(returnDate)
                        .state(RentalState.RETURNED)
                        .build();

                rentalRepository.save(rental);
            }
        }
    }
}