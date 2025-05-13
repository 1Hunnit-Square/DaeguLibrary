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
public class ClosedDay {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long closedId;	//휴관일 번호
	
	@Column(nullable = false)
	private LocalDate closedDate; 	//휴관일
	
	@Column(nullable = false)
	private boolean isClosed;	//휴관일 여부
	
	
}
