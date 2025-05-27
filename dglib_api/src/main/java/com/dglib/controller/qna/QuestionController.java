package com.dglib.controller.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.qna.QuestionDTO;
import com.dglib.entity.qna.Question;
import com.dglib.repository.qna.QuestionSpecifications;
import com.dglib.service.qna.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {

	private final QuestionService questionService;
	
	//등록
	@PostMapping
	public ResponseEntity<Long> createQuestion(@RequestBody QuestionDTO dto) {
		Long qno = questionService.createQuestion(dto);
		return ResponseEntity.ok(qno);
	}
	
	//상세 조회
	@GetMapping("/{qno}")
	public ResponseEntity<QuestionDTO> getQuestion(
			@PathVariable Long qno, 
			@RequestParam(required = false, defaultValue = "") String requesterMid)	{
		return ResponseEntity.ok(questionService.getQuestion(qno, requesterMid));
	}
	

	//조회 및 검색
	@GetMapping
	public ResponseEntity<Page<QuestionDTO>> getQuestions(
	    @RequestParam(required = false, name = "keyword") String query,
	    @RequestParam(required = false, name = "searchType") String option,
	    @RequestParam(required = false, defaultValue = "") String requesterMid,
	    @RequestParam(defaultValue = "0") int page,
	    @RequestParam(defaultValue = "10") int size
	) {
		Pageable pageable = PageRequest.of(page, size);
		
		Page<QuestionDTO> result;
		
		if(query != null && !query.isBlank()) {
			Specification<Question> spec = QuestionSpecifications.searchFilter(query, option, requesterMid);
			result = questionService.getQuestionsWithSpecification(spec, pageable, requesterMid);
		} else  {
			result = questionService.getQuestionsWithStatus(pageable, requesterMid);
		}
		
		return ResponseEntity.ok(result);
	}
	
	
	
	// 수정
	@PutMapping("/{qno}")
	public ResponseEntity<Void>	updateQuestion(
			@PathVariable Long qno, 
			@RequestBody QuestionDTO dto) {
		
		questionService.updateQuestion(qno, dto);
		return ResponseEntity.noContent().build();
	}
	
	
	// 삭제
	@DeleteMapping("/{qno}")
	public ResponseEntity<Void> deleteQuestion(@PathVariable Long qno, @RequestParam String requesterMid){
		questionService.deleteQuestion(qno, requesterMid);
		return ResponseEntity.noContent().build();
	}
	
	
}
