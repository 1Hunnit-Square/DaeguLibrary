package com.dglib.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventBannerDTO {
	
	private Long bno;
	private String imageName;
	private String imageUrl;
	private Long eno;
	private Boolean isPinned;

}
