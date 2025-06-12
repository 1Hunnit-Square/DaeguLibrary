package com.dglib.controller.qna;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
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
@RequestMapping("/api/answer")
public class AnswerController {

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
	
	@PutMapping(value = "/question/{qno}")
	public ResponseEntity<?> updateAnswer(
	        @PathVariable Long qno,
	        @ModelAttribute AnswerDTO dto) {

	    answerService.updateAnswer(qno, dto);
	    return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/{ano}")
	public ResponseEntity<Void> deleteAnswer(@PathVariable Long ano, @RequestBody Map<String, String> body){
	    String requesterMid = body.get("requesterMid");
	    answerService.deleteAnswer(ano, requesterMid);
	    return ResponseEntity.noContent().build();
	}
	
	
}
