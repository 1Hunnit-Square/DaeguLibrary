package com.dglib.dto.mail;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailContentDTO {
	private String content;
	private List<MailFileDTO> fileList;
}
