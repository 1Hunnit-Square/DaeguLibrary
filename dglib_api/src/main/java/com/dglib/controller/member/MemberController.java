package com.dglib.controller.member;


import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberSeaerchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.service.member.MemberCardService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {
	
	private final Logger LOGGER = LoggerFactory.getLogger(MemberController.class);
	private final MemberService memberService;
	private final MemberCardService cardService;
	
	@GetMapping("searchmembernumber/{memberNumber}")
	public ResponseEntity<Page<MemberSeaerchByMnoDTO>> searchMemberNumber(@PathVariable String memberNumber, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
		LOGGER.info("memberNumber: {}", memberNumber);
		Pageable pageable = PageRequest.of(page -1, size);
		Page<MemberSeaerchByMnoDTO> memberList = memberService.searchByMno(memberNumber, pageable);
		

		return ResponseEntity.ok(memberList);
	}
	
	@GetMapping("/listMember")
	public ResponseEntity<Page<MemberListDTO>> listMember(@ModelAttribute MemberSearchDTO searchDTO){
		System.out.println(searchDTO);
		int page = searchDTO.getPage() > 0 ? searchDTO.getPage() : 1;
		int size = searchDTO.getSize() > 0 ? searchDTO.getSize() : 10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("mno");
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
			    ? Sort.by(sortBy).ascending() 
			    : Sort.by(sortBy).descending();
		
		
		Pageable pageable = PageRequest.of(page - 1, size, sort);
		Page<MemberListDTO> memberList = memberService.findAll(searchDTO, pageable);
		return ResponseEntity.ok(memberList);
	}
	
	@PostMapping("/register")
	public ResponseEntity<String> regMember (@RequestBody RegMemberDTO regMemberDTO){
		memberService.registerMember(regMemberDTO);
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/cardinfo")
	public ResponseEntity<Map<String, String>> getCardInfo (@RequestParam String mid){
		return ResponseEntity.ok(cardService.setQRinfo(mid));
	}
	
	@GetMapping("/existId")
	public ResponseEntity<Boolean> existById(@RequestParam String mid){
		return ResponseEntity.ok(memberService.existById(mid));
	}


}
