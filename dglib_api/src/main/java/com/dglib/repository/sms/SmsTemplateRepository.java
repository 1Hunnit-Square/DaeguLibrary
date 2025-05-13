package com.dglib.repository.sms;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.sms.SmsTemplate;

public interface SmsTemplateRepository extends JpaRepository<SmsTemplate, Long>{

}
