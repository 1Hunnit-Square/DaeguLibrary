package com.dglib.dto.member;

import java.time.LocalDate;

import com.dglib.entity.member.MemberState;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberSeaerchByMnoDTO {
	
	private String mid;
	private String name;
	private String mno;
	private String gender;
	private LocalDate birthDate;
	private String phone;
	private String addr;
	private LocalDate panalty;
    private MemberState state;
    private Long rentalCount;
    private Long reserveCount;


}
