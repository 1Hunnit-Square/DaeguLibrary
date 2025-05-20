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
	private LocalDate birthDate;
	private MemberRole role;
	private MemberState state;
	private int penaltyDays;
}
