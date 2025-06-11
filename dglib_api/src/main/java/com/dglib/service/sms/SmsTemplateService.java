package com.dglib.service.sms;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dglib.dto.sms.SmsTemplateDTO;

public interface SmsTemplateService {

	Long regTemplate(String content);
	
	Page<SmsTemplateDTO> getTemplate(Pageable pageable);
	
	void delTemplate(Long id);
	
	void modTemplate(Long id, String content);
	
	String findTemplate(Long id);
}
