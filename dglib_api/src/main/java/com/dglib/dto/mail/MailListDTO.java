package com.dglib.dto.mail;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
public class MailListDTO {
	private String eid;
	private String subject;
	private String fromEmail;
	private String fromName;
	private List<String> toEmail;
	private List<String> toName;
	boolean isRead;
	LocalDateTime sentTime;
	
}
