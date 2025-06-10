package com.dglib.dto.gallery;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GalleryListDTO {
	private Long gno;
	private String title;
	private String name;
	private LocalDateTime postedAt;
	private int viewCount;
	
	private String thumbnailPath;
}
