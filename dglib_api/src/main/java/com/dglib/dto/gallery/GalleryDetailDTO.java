package com.dglib.dto.gallery;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class GalleryDetailDTO {

	private String title;
	private String content;
	private int viewCount;
	private String name;
	private LocalDateTime postedAt;
	private LocalDateTime modifiedAt;
	private List<GalleryImageDTO> imageDTO;
}
