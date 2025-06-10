package com.dglib.dto.gallery;

import java.util.List;

import lombok.Data;

@Data
public class GalleryDTO {
	
	private String title;
	private String content;
	private boolean isHidden;
	private String mid;
	private List<String> urlList;
	private List<GalleryImageDTO> imageDTO;
	

}
