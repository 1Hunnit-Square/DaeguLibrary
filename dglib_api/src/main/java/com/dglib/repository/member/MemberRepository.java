package com.dglib.repository.member;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.entity.member.Member;

public interface MemberRepository extends JpaRepository<Member, String> {
	
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

	@Query("SELECT COUNT(m) > 0 FROM Member m WHERE REPLACE(m.phone, '-', '') = :phone")
	boolean existsByPhone(String phone);
	
	@EntityGraph(attributePaths = {"rentals"})
	@Query(""" 	
			SELECT m FROM Member m 
			WHERE NOT EXISTS ( SELECT r FROM Rental r WHERE r MEMBER OF m.rentals 
			AND r.dueDate < CURRENT_DATE AND r.state = com.dglib.entity.book.RentalState.BORROWED ) 
			AND (m.penaltyDate < CURRENT_DATE OR m.penaltyDate IS NULL) 
			AND m.state != com.dglib.entity.member.MemberState.LEAVE 
			AND m.state != com.dglib.entity.member.MemberState.PUNISH 
			""")
	List<Member> findMembersWithPenaltyDateButNotOverdue();


}
