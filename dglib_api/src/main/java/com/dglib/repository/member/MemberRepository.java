package com.dglib.repository.member;

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
		       "SUM(CASE WHEN r.state = com.dglib.entity.book.RentalState.BORROWED THEN 1 ELSE 0 END), " +
		       "SUM(CASE WHEN rs.state = com.dglib.entity.book.ReserveState.RESERVED THEN 1 ELSE 0 END)) " +
		       "FROM Member m " +
		       "LEFT JOIN m.rentals r " +
		       "LEFT JOIN m.reserves rs " +
		       "WHERE m.mno = :mno " +
		       "GROUP BY m")
	Page<MemberSeaerchByMnoDTO> findByMno(String mno, Pageable pageable);
	
	Optional<Member> findByMno(String mno);
	
	Long countByMnoLike(String mno);


}
