package com.dglib.dto.member;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberScanDTO {

	String mno;
	String name;
	boolean expired;
	
}
