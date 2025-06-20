package com.dglib.dto.mail;

import lombok.Data;

@Data
public class MailSearchDTO {
	int page;
	int size;
	String mailType;
	boolean notRead;
}
