package com.dglib.dto.member;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MemberInfoDTO {
	private String mid;
	private String pw;
	private String name;
	private String gender;
	private LocalDate birthDate;
	private String phone;
	private String addr;
	private String email;
	private String kakao;
	private boolean checkSms;
	private boolean checkEmail;
}
