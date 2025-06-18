package com.dglib.dto.member;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MemberBasicDTO {
	private String gender;
	private LocalDate birthDate;
	private String phone;
	private String addr;
}
