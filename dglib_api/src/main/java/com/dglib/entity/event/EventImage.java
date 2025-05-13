package com.dglib.entity.event;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_img")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventImage {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long eino;
	
	@Column(nullable = false, length = 500)
	private String imageUrl;
	
	@Column(nullable = false, length = 255)
	private String originalFilename;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "eventEno", nullable = false) // 글번호(FK)
	private Event event;

}
