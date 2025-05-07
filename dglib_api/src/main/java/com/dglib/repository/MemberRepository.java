package com.dglib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dglib.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

}
