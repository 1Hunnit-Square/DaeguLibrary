package com.dglib.repository.member;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.entity.member.Member;

public interface MemberRepository extends JpaRepository<Member, String>, JpaSpecificationExecutor<Member>{
	
	@EntityGraph(attributePaths = {"rentals", "reserves"})
	@Query("SELECT new com.dglib.dto.member.MemberSeaerchByMnoDTO(" +
		       "m.id, m.name, m.mno, m.gender, m.birthDate, m.phone, m.addr, " +
		       "m.penaltyDate, m.state, " +
		       "(SELECT COUNT(r2) FROM Rental r2 WHERE r2.member = m AND r2.state = com.dglib.entity.book.RentalState.BORROWED), " +
		       "(SELECT COUNT(rs2) FROM Reserve rs2 WHERE rs2.member = m AND rs2.state = com.dglib.entity.book.ReserveState.RESERVED)) " +
		       "FROM Member m " +
		       "WHERE m.mno LIKE %:mno% ")
	Page<MemberSeaerchByMnoDTO> findByMno(String mno, Pageable pageable);
	
	Optional<Member> findByMno(String mno);
	
	Long countByMnoLike(String mno);
	
	boolean existsByPhone(String phone);
	
	Page<Member> findAll (Specification<Member> spec, Pageable pageable);
	
	Optional<Member> findByNameAndBirthDateAndPhone (String name, LocalDate birthDate, String phone);
	
	boolean existsByMidAndBirthDateAndPhone (String mid, LocalDate birthDate, String phone);
	
}
