package com.dglib.dto.mail;

import lombok.Data;

@Data
public class MailSendDTO {
	private String subject;
	private String content;
	private String to;
	private String trackPath;
}
