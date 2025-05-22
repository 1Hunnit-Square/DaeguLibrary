package com.dglib.dto.member;

import java.time.LocalDate;

import com.dglib.entity.member.MemberRole;
import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class MemberManageDTO {
	String mid;
	MemberRole role;
	MemberState state;
	LocalDate penaltyDate;

	
}
