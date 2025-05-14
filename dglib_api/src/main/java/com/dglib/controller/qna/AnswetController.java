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

import com.dglib.dto.qna.AnswerDTO;
import com.dglib.service.qna.AnswerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/answer")
public class AnswetController {

	private final AnswerService answerService;
	
	@PostMapping
	public ResponseEntity<Long> createAnswer(@RequestBody AnswerDTO dto){
		Long ano = answerService.createAnswer(dto);
		return ResponseEntity.ok(ano);
	}
	
	@GetMapping("/{ano}")
	public ResponseEntity<AnswerDTO> getAnswer(@PathVariable Long ano){
		return ResponseEntity.ok(answerService.getAnswer(ano));
	}
	
	@PutMapping("/{ano}")
	public ResponseEntity<Void> updateAnswer(
			@PathVariable Long ano,
			@RequestBody AnswerDTO dto) {
		
		answerService.updateAnswer(ano, dto);
		return ResponseEntity.noContent().build();
	}
	
	@DeleteMapping("/{ano}")
	public ResponseEntity<Void> deleteAnswer(@PathVariable Long ano){
		answerService.deleteAnswer(ano);
		return ResponseEntity.noContent().build();
	}
	
	
	
	
}
