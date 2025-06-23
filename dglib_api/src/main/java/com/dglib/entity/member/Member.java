package com.dglib.entity.member;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.dglib.entity.book.InterestedBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Member {
	@Id
	@Column(length = 16)
	private String mid;
	
	@Column(nullable = false)
	private String pw;
	
	@Column(nullable = false, length = 18)
	private String name;
	
	@Column(nullable = false, length = 10, unique = true)
	private String mno;
	
	@Column(nullable = false, length = 3)
	private String gender;
	
	@Column(nullable = false)
	private LocalDate birthDate;
	
	@Column(nullable = false, length = 14)
	private String phone;
	
	@Column(nullable = false, length = 200)
	private String addr;
	
	@Column(length = 100)
	private String email;
	
	@Column(nullable = false)
	private boolean checkSms;
	
	@Column(nullable = false)
	private boolean checkEmail;
	
	@Column
	private LocalDate penaltyDate;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
    private MemberRole role;
	
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
    private MemberState state;
	
	private String kakao;
	
	@OneToMany(mappedBy = "member")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
	private Set<Rental> rentals;
	
	@OneToMany(mappedBy = "member")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
	private Set<Reserve> reserves;

	
	@OneToMany(mappedBy = "member")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
	private List<InterestedBook> interestedBooks;
	

	public List<Rental> getOverRentalList (){
		if(this.rentals == null) {
			return Collections.emptyList();
		}
		return this.rentals.stream()
		.filter(rental -> LocalDate.now().isAfter(rental.getDueDate()) && rental.getReturnDate() == null && rental.getState() == RentalState.BORROWED)
		.collect(Collectors.toList());
	}
}
