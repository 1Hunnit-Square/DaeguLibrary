package com.dglib.entity.member;

import java.time.LocalDate;
import java.util.List;

import com.dglib.entity.book.Rental;
import com.dglib.entity.book.Reserve;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
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
	
	@Column(nullable = false, length = 100)
	private String email;
	
	@Column(nullable = false)
	private boolean checkSms;
	
	@Column(nullable = false)
	private boolean checkEmail;
	
	@Column(nullable = false)
	private boolean checkTerms;
	
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
	private List<Rental> rentals;
	
	@OneToMany(mappedBy = "member")
	private List<Reserve> reserves;
	

}
