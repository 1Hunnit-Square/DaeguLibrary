package com.dglib.repository.notice;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.notice.NoticeSearchDTO;
import com.dglib.entity.notice.Notice;

public class NoticeSpecifications {
	public static Specification<Notice> fromDTO(NoticeSearchDTO dto) {
        return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
        		.and((root, query, cb) -> cb.equal(root.get("isHidden"), false));
    }


public static Specification<Notice> searchFilter(String option, String queryStr) {
    return (root, query, cb) -> {
    	if(option == null || queryStr == null) 	{
    		return null;
    	}
    	
        switch(option) {
        case "제목":
    	return cb.like(root.get("title"), "%" + queryStr + "%");
    	
        case "내용":
        return cb.like(root.get("content"), "%" + queryStr + "%");
        
        case "작성자":
        return cb.like(root.get("member").get("name"), "%" + queryStr + "%");
        
        default:
        return null;
        }
};
}


}