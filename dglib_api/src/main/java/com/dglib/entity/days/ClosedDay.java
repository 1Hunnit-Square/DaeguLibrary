package com.dglib.entity.days;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "closed_day")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClosedDay {

	@Id
	private LocalDate closedDate; 	//휴관일
	
	@Column(length = 100, nullable = false)
    private String reason; // 휴관 사유	
	
	@Column(nullable = false)
	private Boolean isClosed;	//휴관일 여부
	
}
