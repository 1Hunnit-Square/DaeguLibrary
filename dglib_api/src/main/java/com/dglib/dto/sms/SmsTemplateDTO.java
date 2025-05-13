package com.dglib.dto.sms;

import lombok.Data;

@Data
public class SmsTemplateDTO {

	private Long templateId;	//템플릿 번호
	private String content;	//문자 내용
}
