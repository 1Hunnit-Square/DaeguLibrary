package com.dglib.entity.sms;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SmsTemplate {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long templateId;	//템플릿 번호
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;	//문자 내용
}
