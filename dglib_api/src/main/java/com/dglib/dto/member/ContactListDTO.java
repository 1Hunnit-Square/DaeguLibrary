package com.dglib.dto.member;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ContactListDTO {
	private String mid;
	private String mno;
	private String name;
	private String phone;
	private String checkSms;
	private LocalDate overdueDate;
	private int overdueCount;

}
