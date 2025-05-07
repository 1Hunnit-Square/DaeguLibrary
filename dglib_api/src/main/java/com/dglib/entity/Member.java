package com.dglib.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
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
	private String id;
	
	@Column(nullable = false, length = 16)
	private String pw;
	
	@Column(nullable = false, length = 18)
	private String name;
	
	@Column(nullable = false, length = 10)
	private int mno;
	
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
	
	@Column(nullable = false)
	private int panalty;
	
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
    private MemberRole role;
	
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
    private MemberState state;
	
	private String kakao;
	

}
