package com.dglib.dto.member;

import java.time.LocalDate;

import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class MemberListDTO {
	private Long index;
	private String mid;
	private String mno;
	private String name;
	private String gender;
	private String phone;
	private String email;
	private String addr;
	private String checkSms;
	private String checkEmail;
	private LocalDate birthDate;
	private LocalDate penaltyDate;
	private MemberRole role;
	private MemberState state;

}
