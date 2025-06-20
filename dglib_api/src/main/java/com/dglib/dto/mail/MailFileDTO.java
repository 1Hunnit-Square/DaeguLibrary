package com.dglib.dto.mail;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MailFileDTO {
	private String originalName;
	
	private String fileType;
	
	private String filePath;
}
