package com.dglib.service.sms;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.sms.SmsTemplateDTO;
import com.dglib.entity.sms.SmsTemplate;
import com.dglib.repository.sms.SmsTemplateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SmsTemplateServiceImpl implements SmsTemplateService {

	private final SmsTemplateRepository smsTemplateRepository;
	private final ModelMapper modelMapper;
	
	@Override
	public Long regTemplate(String content) {
		SmsTemplate smsTemplate = new SmsTemplate();
		smsTemplate.setContent(content);
		smsTemplateRepository.save(smsTemplate);
		return smsTemplate.getTemplateId();
	}
	
	@Override
	public Page<SmsTemplateDTO> getTemplate(Pageable pageable) {
		Page<SmsTemplate> templates = smsTemplateRepository.findAll(pageable);
		return templates.map(template -> modelMapper.map(template, SmsTemplateDTO.class));
	}
	
	@Override
	public void delTemplate(Long id) {
		SmsTemplate template = smsTemplateRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Template not found"));
		smsTemplateRepository.delete(template);		
	}
	
	@Override
	public void modTemplate(Long id, String content) {
		SmsTemplate template = smsTemplateRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Template not found"));
		template.setContent(content);
		smsTemplateRepository.save(template);
	}
	
	@Override
	public String findTemplate(Long id) {
		SmsTemplate template = smsTemplateRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Template not found"));
		return template.getContent();
	}
	
	
}
