package com.dglib.dto.common;

import java.util.List;

import lombok.Data;

@Data
public class SmsRequestDTO {
    private List<String> phoneList;
    private String message;
    private String authCode;
}
