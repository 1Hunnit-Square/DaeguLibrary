package com.dglib.dto.mail;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class MailDTO {
	private String subject;
	private String content;
	private String fromEmail;
	private String fromName;
	private List<String> toEmail;
	private List<String> toName;
	private List<String> fileName;
	LocalDateTime sentTime;
	
}
