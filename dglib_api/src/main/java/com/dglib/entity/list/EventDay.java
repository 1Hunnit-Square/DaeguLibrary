package com.dglib.entity.list;

import java.time.LocalDate;

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
public class EventDay {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long eventNo; 	//일정 번호
	
	@Column(nullable = false)
	private LocalDate eventDate;	//일정일
	
	@Column(nullable = false, length = 30)
	private String eventType;	//행사종류
	
	@Column(nullable = false, length = 50)
	private String eventName;	//행사이름
	
}
