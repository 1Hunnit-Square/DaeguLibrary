package com.dglib.entity.program;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
public class ProgramBanner {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long bno;
	
	@Column(nullable = false, length = 100)
	private String imageName;

	@Column(nullable = false, length = 200)
	private String imageUrl;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "progNo", nullable = false)
	private ProgramInfo programInfo;

}