package com.dglib.dto.gallery;

import lombok.Data;

@Data
public class GallerySearchDTO {
	private String query;
	private int page;
	private int size;
	private String option;
	private String sortBy;
	private String orderBy;
}
