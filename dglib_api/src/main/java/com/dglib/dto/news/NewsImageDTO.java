package com.dglib.dto.news;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsImageDTO {
	
	private Long nino;
	private String imageUrl;
	private String OriginalFilename;

}
