package com.dglib.entity.book;

import java.time.LocalDate;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Keyword {
	
	@Id
	@Column(length = 255)
	String keyword;
	
	@Column(nullable = false)
	Long searchCount;
	
	@Column(nullable = false)
	LocalDate lastSearchDate;
	

}
