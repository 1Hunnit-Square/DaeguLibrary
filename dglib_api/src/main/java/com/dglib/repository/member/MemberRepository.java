package com.dglib.repository.member;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.entity.member.Member;

public interface MemberRepository extends JpaRepository<Member, String>, JpaSpecificationExecutor<Member>{
	
	@EntityGraph(attributePaths = {"rentals", "reserves"})
	@Query("""
		    SELECT new com.dglib.dto.member.MemberSearchByMnoDTO(
		        m.id, m.name, m.mno, m.gender, m.birthDate, m.phone, m.addr,
		        m.penaltyDate, m.state,
		        (SELECT COUNT(r2) FROM Rental r2 WHERE r2.member = m AND r2.state = com.dglib.entity.book.RentalState.BORROWED),
		        (SELECT COUNT(rs2) FROM Reserve rs2 WHERE rs2.member = m AND rs2.state = com.dglib.entity.book.ReserveState.RESERVED AND rs2.isUnmanned = false),
		        (SELECT COUNT(rs3) FROM Reserve rs3 WHERE rs3.member = m AND rs3.state = com.dglib.entity.book.ReserveState.RESERVED AND rs3.isUnmanned = true)
		    )
		    FROM Member m
		    WHERE m.mno LIKE %:mno%
		    """)
	Page<MemberSearchByMnoDTO> findByMno(String mno, Pageable pageable);

	
	Optional<Member> findByMno(String mno);
	
	Optional<Member> findByKakao(String kakao);
	
	Long countByMnoLike(String mno);
	
	boolean existsByPhone(String phone);
	

	Page<Member> findAll (Specification<Member> spec, Pageable pageable);
	
	Optional<Member> findByNameAndBirthDateAndPhone (String name, LocalDate birthDate, String phone);
	
	boolean existsByMidAndBirthDateAndPhone (String mid, LocalDate birthDate, String phone);
	

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
	
	
	@Query(value = """
		   SELECT isbn FROM (
			    SELECT DISTINCT b.isbn, r.rent_start_date
			    FROM library_book lb
			    JOIN book b ON lb.isbn = b.isbn
			    JOIN rental r ON lb.library_book_id = r.library_book_id
			    WHERE r.mid = :mid
			    ORDER BY r.rent_start_date DESC
			) AS sub
			LIMIT 40;
		    """,
		    nativeQuery = true)
	List<String> find40borrowedIsbn(
	 @Param("mid") String mid);
	
	@Query(value = """
			   SELECT isbn FROM (
				    SELECT DISTINCT b.isbn, r.rent_start_date
				    FROM library_book lb
				    JOIN book b ON lb.isbn = b.isbn
				    JOIN rental r ON lb.library_book_id = r.library_book_id
				    WHERE r.mid = :mid
				    ORDER BY r.rent_start_date DESC
				) AS sub
				LIMIT 5;
			    """,
			    nativeQuery = true)
		List<String> find5borrowedIsbn(
		 @Param("mid") String mid);


	

}
