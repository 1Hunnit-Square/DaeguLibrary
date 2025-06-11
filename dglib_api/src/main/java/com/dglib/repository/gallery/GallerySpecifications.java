package com.dglib.repository.gallery;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.gallery.GallerySearchDTO;
import com.dglib.entity.gallery.Gallery;

public class GallerySpecifications {
	public static Specification<Gallery> fromDTO(GallerySearchDTO dto) {
		return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
				.and((root, query, cb) -> cb.equal(root.get("isHidden"), false));
	}

	public static Specification<Gallery> searchFilter(String option, String queryStr) {
		return (root, query, cb) -> {
			if (option == null || queryStr == null) {
				return null;
			}
			switch (option) {
			case "제목":
				return cb.like(root.get("title"), "%" + queryStr + "%");

			case "내용":
				return cb.like(root.get("content"), "%" + queryStr + "%");

			default:
				return null;
			}
		};
	}
}

