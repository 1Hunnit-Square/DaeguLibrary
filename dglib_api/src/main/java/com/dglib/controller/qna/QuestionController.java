package com.dglib.controller.qna;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.qna.QuestionDTO;
import com.dglib.service.qna.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
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
	public ResponseEntity<Void> deleteQuestion(@PathVariable Long qno){
		questionService.deleteQuestion(qno);
		return ResponseEntity.noContent().build();
	}
}
