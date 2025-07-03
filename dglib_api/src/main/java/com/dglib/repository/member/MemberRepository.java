package com.dglib.repository.member;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.dto.member.AgeCountDTO;
import com.dglib.dto.member.GenderCountDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;


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

	
	Optional<Member> findByKakao(String kakao);
	

	@EntityGraph(attributePaths = {"rentals", "reserves"})
	Optional<Member> findByMno(String mno);
	
	Long countByMnoLike(String mno);
	
	boolean existsByPhoneAndStateNot(String phone, MemberState state);
	
	boolean existsByMidAndPhone(String mid, String phone);

	Page<Member> findAll (Specification<Member> spec, Pageable pageable);
	
	Optional<Member> findByNameAndBirthDateAndPhoneAndStateNot (String name, LocalDate birthDate, String phone, MemberState state);
	
	boolean existsByMidAndBirthDateAndPhoneAndStateNot (String mid, LocalDate birthDate, String phone, MemberState state);
	

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

	
	List<Member> findByMidInAndPenaltyDateGreaterThanEqual(Set<String> memberIds, LocalDate date);
	
	List<Member> findByMidInAndState(Set<String> memberIds, MemberState state);
	
	 @Query("SELECT new com.dglib.dto.member.GenderCountDTO(m.gender, COUNT(m)) " +
	           "FROM Member m WHERE m.state <> 'LEAVE' GROUP BY m.gender ORDER BY m.gender ASC")
	    List<GenderCountDTO> countByGender();
	 
	 
	 @Query(value = """
			    SELECT
			      CASE 
			        WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 10 AND 19 THEN '10대'
			        WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 20 AND 29 THEN '20대'
			        WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 30 AND 39 THEN '30대'
			        WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 40 AND 49 THEN '40대'
			        WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 50 AND 59 THEN '50대'
			        ELSE '60대 이상'
			      END AS ageGroup,
			      COUNT(*) AS count
			    FROM member
			    WHERE state <> 'LEAVE'
			    GROUP BY ageGroup
			    ORDER BY count DESC
			""", nativeQuery = true)
		List<Object[]> countByAgeGroup();
	
			
		@Query(value = """
				    SELECT 
				      CASE 
				        WHEN addr LIKE '%대구 수성구%' THEN '대구 수성구'
				        WHEN addr LIKE '%대구 서구%' THEN '대구 서구'
				        WHEN addr LIKE '%대구 중구%' THEN '대구 중구'
				        WHEN addr LIKE '%대구 동구%' THEN '대구 동구'
				        WHEN addr LIKE '%대구 남구%' THEN '대구 남구'
				        WHEN addr LIKE '%대구 북구%' THEN '대구 북구'
				        WHEN addr LIKE '%대구 달서구%' THEN '대구 달서구'
				        ELSE '기타 지역'
				      END AS regionGroup,
				      COUNT(*) AS count
				    FROM member
				    WHERE state <> 'LEAVE'
				    GROUP BY regionGroup
				    ORDER BY count DESC
				""", nativeQuery = true)
		List<Object[]> countByRegionGroup();
		
		
		@Query("""
			    SELECT m.phone, COUNT(r), m.name 
			    FROM Member m 
			    JOIN m.rentals r 
			    WHERE r.dueDate = :today 
			    AND r.state = com.dglib.entity.book.RentalState.BORROWED
			    GROUP BY m.phone, m.name
			    """)
			List<Object[]> findPhonesWithBookCountByDueDate(@Param("today") LocalDate today);
	

}
