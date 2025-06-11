package com.dglib.dto.member;

import java.time.LocalDate;

import lombok.Data;

@Data
public class MemberFindIdDTO {
String name;
String phone;
LocalDate birthDate;
}
