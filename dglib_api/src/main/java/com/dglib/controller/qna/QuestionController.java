package com.dglib.controller.qna;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.qna.QuestionDetailDTO;
import com.dglib.dto.qna.QuestionListDTO;
import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.qna.QuestionService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {

	private final QuestionService questionService;

//	// 등록
//	@PostMapping
//	public ResponseEntity<Long> createQuestion(@RequestBody QuestionSearchDTO dto) {
//		Long qno = questionService.createQuestion(dto);
//		return ResponseEntity.ok(qno);
//	}
//
//	

	// 목록 및 검색
	@GetMapping
	public ResponseEntity<Page<QuestionListDTO>> listQuestion(@ModelAttribute QuestionSearchDTO searchDTO){
		int page = searchDTO.getPage() > 0? searchDTO.getPage():1;
		int size = searchDTO.getSize() > 0? searchDTO.getSize():10;
		String sortBy = Optional.ofNullable(searchDTO.getSortBy()).orElse("qno");
		String orderBy=Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");
		String requestermid = JwtFilter.getMid();
		
		Sort sort = "asc".equalsIgnoreCase(orderBy) 
				? Sort.by(sortBy).ascending() 
				: Sort.by(sortBy).descending();
		
		Pageable pageable = PageRequest.of(page-1, size, sort);
		
		Page<QuestionListDTO> questionList = questionService.findAll(searchDTO, pageable, requestermid);
		return ResponseEntity.ok(questionList);
	}
	
	// 상세 조회
		@GetMapping("/{qno}")
		public ResponseEntity<QuestionDetailDTO> detailQuestion(@PathVariable Long qno, HttpSession session) {
			questionService.increaseViewCount(qno, session);
			String requestermid = JwtFilter.getMid();
			
			QuestionDetailDTO questionDetail = questionService.getQuestion(qno, requestermid);
			return ResponseEntity.ok(questionDetail);
		}
//
//
//	// 수정
//	@PutMapping("/{qno}")
//	public ResponseEntity<Void>	updateQuestion(
//			@PathVariable Long qno, 
//			@RequestBody QuestionSearchDTO dto) {
//		
//		questionService.updateQuestion(qno, dto);
//		return ResponseEntity.noContent().build();
//	}
//
//	// 삭제
//	@DeleteMapping("/{qno}")
//	public ResponseEntity<Void> deleteQuestion(@PathVariable Long qno, @RequestParam String requesterMid){
//		questionService.deleteQuestion(qno, requesterMid);
//		return ResponseEntity.noContent().build();
//	}

}
