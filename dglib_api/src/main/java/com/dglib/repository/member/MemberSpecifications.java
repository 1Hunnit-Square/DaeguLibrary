package com.dglib.repository.member;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.dglib.dto.member.ContactSearchDTO;
import com.dglib.dto.member.EmailInfoSearchDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class MemberSpecifications {

	public static Specification<Member> fromDTO(MemberSearchDTO dto) {
        return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
                .and(searchState(dto.getState()))
                .and(searchRole(dto.getRole()));
    }
	
	public static Specification<Member> fromDTO(ContactSearchDTO dto) {
        return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
                .and((root, query, cb) -> dto.isCheckSms() ? cb.equal(root.get("checkSms"), true) : cb.conjunction())
                .and(searchOverdue(dto.isCheckOverdue()))
                .and((root, query, cb) -> cb.notEqual(root.get("state"), MemberState.LEAVE));
    }
	
	public static Specification<Member> fromDTO(EmailInfoSearchDTO dto) {
        return Specification.where(searchFilter(dto.getOption(), dto.getQuery()))
                .and((root, query, cb) -> dto.isCheckEmail() ? cb.equal(root.get("checkEmail"), true) : cb.conjunction())
                .and((root, query, cb) -> cb.notEqual(root.get("state"), MemberState.LEAVE));
    }
	
	
	public static Specification<Member> searchFilter(String option, String queryStr) {
        return (root, query, cb) -> {
        	if(option == null || queryStr == null) {
        		return cb.conjunction();
        	}
        	
            switch(option) {
            case "회원ID":
        	return cb.like(root.get("mid"), "%" + queryStr + "%");
        	
            case "이름":
            return cb.like(root.get("name"), "%" + queryStr + "%");
            
            case "회원번호":
            return cb.like(root.get("mno"), "%" + queryStr + "%");
            
            default:
            return cb.conjunction();
            }

    };
	}
	
	public static Specification<Member> searchState(String state) {
        return (root, query, cb) -> {         
            if(state != null && !state.equals("ALL")) {
	            if(state.equals("EVERY")) {
	            return cb.conjunction(); 
	            } else
	        	return cb.equal(root.get("state"), state);
            }
            return cb.notEqual(root.get("state"), MemberState.LEAVE);    	
    };
	}
	
	public static Specification<Member> searchRole(String role) {
        return (root, query, cb) -> {         
            if(role != null && !role.equals("ALL"))
        	return cb.equal(root.get("role"), role);
            
            return cb.conjunction();    	
    };
	}
	
	public static Specification<Member> searchOverdue(boolean checkOverdue) {
        return (root, query, cb) -> {         
            if(checkOverdue) {
            query.distinct(true);  // Member 중복 제거해야 배열형태가 됨
            Join<Member, Rental> rentalJoin = root.join("rentals", JoinType.INNER);
            
        	return cb.and(
        			cb.lessThan(rentalJoin.get("dueDate"), LocalDate.now()),
        			cb.isNull(rentalJoin.get("returnDate")),
        			cb.equal(rentalJoin.get("state"), RentalState.BORROWED)
        			);
            }
            return cb.conjunction();    	
    };
	}
	
}
