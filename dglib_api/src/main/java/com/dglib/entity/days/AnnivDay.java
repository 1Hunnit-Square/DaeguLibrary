package com.dglib.entity.days;

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
public class AnnivDay {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long annivNo; 	//일정 번호
	
	@Column(nullable = false)
	private LocalDate annivDate;	//일정일
	
	@Column(nullable = false, length = 30)
	private String annivType;	//행사종류
	
	@Column(nullable = false, length = 50)
	private String annivName;	//행사이름
	
}
