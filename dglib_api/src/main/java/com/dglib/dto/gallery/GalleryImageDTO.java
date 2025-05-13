package com.dglib.dto.gallery;

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
public class GalleryImageDTO {
	
	private Long gino;
	private String imageUrl;
	private String OriginalFilename;

}
