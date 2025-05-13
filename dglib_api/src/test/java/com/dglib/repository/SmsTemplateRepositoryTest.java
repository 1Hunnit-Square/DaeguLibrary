package com.dglib.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.dglib.entity.sms.SmsTemplate;
import com.dglib.repository.sms.SmsTemplateRepository;

import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class SmsTemplateRepositoryTest {

    @Autowired
    private SmsTemplateRepository smsTemplateRepository;

//    @Test
    @DisplayName("문자 템플릿 등록")
    public void createSmsTemplate() {
        SmsTemplate template = SmsTemplate.builder()
                .content("문자 테스트 1")
                .build();

        SmsTemplate saved = smsTemplateRepository.save(template);
        System.out.println("템플릿ID: " + saved.getTemplateId());
    }

//    @Test
    @DisplayName("문자 템플릿 조회")
    public void readSmsTemplate() {
        SmsTemplate saved = smsTemplateRepository.save(
                SmsTemplate.builder()
                        .content("문자 테스트 2")
                        .build()
        );

        SmsTemplate found = smsTemplateRepository.findById(saved.getTemplateId()).orElse(null);
        if (found != null) {
            System.out.println("조회된 문자 내용: " + found.getContent());
        }
    }

//    @Test
    @DisplayName("문자 템플릿 수정")
    public void updateSmsTemplate() {
        SmsTemplate saved = smsTemplateRepository.save(
                SmsTemplate.builder()
                        .content("수정 전 내용")
                        .build()
        );

        saved.setContent("수정 후 내용");
        smsTemplateRepository.save(saved);
    }

    @Test
    @DisplayName("문자 템플릿 삭제")
    public void deleteSmsTemplate() {
        SmsTemplate saved = smsTemplateRepository.save(
                SmsTemplate.builder()
                        .content("삭제할 내용")
                        .build()
        );

        Long id = saved.getTemplateId();
        smsTemplateRepository.deleteById(id);

        boolean exists = smsTemplateRepository.findById(id).isPresent();
        System.out.println("삭제 여부: " + (exists ? "실패" : "성공"));
    }
}
