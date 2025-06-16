package com.dglib.dto.program;

import lombok.Data;

@Data
public class ProgramBannerDTO {

	private Long bno;
	private String imageName;
	private String imageUrl;
	private String thumbnailPath;
	private Long programInfoId;

}
