package com.dglib.dto.sms;

import java.util.Map;

import lombok.Data;

@Data
public class SmsReturnRequestDTO {
	private Map<String, String> phoneMap;

}
