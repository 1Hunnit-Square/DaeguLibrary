package com.dglib.controller.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import com.dglib.service.qna.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {

	private final QuestionService questionService;
	
	@PostMapping
	public ResponseEntity<Long> createQuestion(@RequestBody QuestionDTO dto) {
		Long qno = questionService.createQuestion(dto);
		return ResponseEntity.ok(qno);
	}
	
	
	@GetMapping("/{qno}")
	public ResponseEntity<QuestionDTO> getQuestion(@PathVariable Long qno)	{
		return ResponseEntity.ok(questionService.getQuestion(qno));
	}
	
	@PutMapping("/{qno}")
	public ResponseEntity<Void>	updateQuestion(
			@PathVariable Long qno, 
			@RequestBody QuestionDTO dto) {
		
		questionService.updateQuestion(qno, dto);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/{qno}")
	public ResponseEntity<Void> deleteQuestion(@PathVariable Long qno, @RequestParam String mid){
		questionService.deleteQuestion(qno, mid);
		return ResponseEntity.noContent().build();
	}
	
	
	@GetMapping
	public ResponseEntity<Page<QuestionDTO>> getQuestions(Pageable pageable){
		Page<QuestionDTO> questions = questionService.getQuestions(pageable);
		return ResponseEntity.ok(questions);
	}
}
