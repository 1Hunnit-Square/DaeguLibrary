package com.dglib.dto.gallery;

import java.util.List;

import lombok.Data;

@Data
public class GalleryUpdateDTO {
	private String title;
	private String content;
	private boolean hidden;
	private String mid;

	private List<String> urlList;
	private List<String> oldFiles;
}
