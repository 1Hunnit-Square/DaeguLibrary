package com.dglib.dto.member;

import lombok.Data;

@Data
public class ContactSearchDTO {
	private String query;
	private String option;
	private boolean checkSms;
	private boolean checkOverdue;
}
