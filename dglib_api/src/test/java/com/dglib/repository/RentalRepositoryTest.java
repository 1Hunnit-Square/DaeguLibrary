package com.dglib.repository;

import java.time.LocalDate;

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
	public void testSaveAndReturnAllRentals() {

	    Member member = memberRepository.findById("kdh3502")
	            .orElseThrow(() -> new RuntimeException("Member not found"));

	    LibraryBook libraryBook = libraryBookRepository.findById(1L)
	            .orElseThrow(() -> new RuntimeException("LibraryBook not found"));

	    saveAndReturnRentals(member, libraryBook, 2023, 10);
	    saveAndReturnRentals(member, libraryBook, 2024, 11);
	    saveAndReturnRentals(member, libraryBook, 2025, 15);
	}

	private void saveAndReturnRentals(Member member, LibraryBook libraryBook, int year, int count) {
	    for (int i = 0; i < count; i++) {
	        LocalDate rentStartDate = LocalDate.of(year, 1, 1).plusDays(i);
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
