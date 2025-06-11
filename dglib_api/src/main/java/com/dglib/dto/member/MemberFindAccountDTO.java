package com.dglib.dto.member;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MemberFindAccountDTO {
String mid;
String phone;
LocalDate birthDate;

}
