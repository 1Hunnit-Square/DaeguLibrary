package com.dglib.dto.member;

import lombok.Data;

@Data
public class MemberSearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
	private String role;
	private String state;
}
