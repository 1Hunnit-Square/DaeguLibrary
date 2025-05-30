package com.dglib.dto.member;

import java.util.List;

import lombok.Data;

@Data
public class MemberRecoBookDTO {
	
	private List<String> isbns;
	private Long gender;
	private Long age;

}
