package com.dglib.repository.member;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.entity.member.Member;

public class MemberSpecifications {

	public static Specification<Member> fromDTO(MemberSearchDTO dto) {
        return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
                .and(searchState(dto.getState()))
                .and(searchRole(dto.getRole()));
    }
	
	
	public static Specification<Member> searchFilter(String option, String queryStr) {
        return (root, query, cb) -> {
        	if(option == null || queryStr == null) {
        		return null;
        	}
        	
            switch(option) {
            case "회원ID":
        	return cb.like(root.get("mid"), "%" + queryStr + "%");
        	
            case "이름":
            return cb.like(root.get("name"), "%" + queryStr + "%");
            
            case "회원번호":
            return cb.like(root.get("mno"), "%" + queryStr + "%");
            
            default:
            return null;
            }

    };
	}
	
	public static Specification<Member> searchState(String state) {
        return (root, query, cb) -> {         
            if(state != null && !state.equals("ALL"))
        	return cb.equal(root.get("state"), state);
            
            return null;    	
    };
	}
	
	public static Specification<Member> searchRole(String role) {
        return (root, query, cb) -> {         
            if(role != null && !role.equals("ALL"))
        	return cb.equal(root.get("role"), role);
            
            return null;    	
    };
	}
	
}
