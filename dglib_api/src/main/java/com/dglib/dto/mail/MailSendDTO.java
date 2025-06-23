package com.dglib.dto.mail;

import java.util.List;

import lombok.Data;

@Data
public class MailSendDTO {
	private String subject;
	private String content;
	private List<String> to;
	private String trackPath;
	private List<String> urlList;
}
