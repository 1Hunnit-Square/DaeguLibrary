package com.dglib.controller.qna;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.qna.AdminQnaDTO;
import com.dglib.dto.qna.AdminQnaSearchDTO;
import com.dglib.dto.qna.QuestionDetailDTO;
import com.dglib.dto.qna.QuestionListDTO;
import com.dglib.dto.qna.QuestionNewDTO;
import com.dglib.dto.qna.QuestionSearchDTO;
import com.dglib.dto.qna.QuestionUpdateDTO;
import com.dglib.security.jwt.JwtFilter;
import com.dglib.service.qna.AdminQnaService;
import com.dglib.service.qna.QuestionService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {

	private final QuestionService questionService;
	private final AdminQnaService adminQnaService;
	
	// 등록
	@PostMapping
	public ResponseEntity<Long> createQuestion(@RequestBody QuestionNewDTO newDTO) {
		String writerMid = JwtFilter.getMid();
		newDTO.setMemberMid(writerMid);
		Long qno = questionService.newQuestion(newDTO);
		return ResponseEntity.ok(qno);
	}

	// 목록 및 검색
	@GetMapping
	public ResponseEntity<Page<QuestionListDTO>> listQuestion(@ModelAttribute QuestionSearchDTO searchDTO) {
		int page = searchDTO.getPage(); // 기본값 1
		int size = searchDTO.getSize(); // 기본값 10
		String sortBy = searchDTO.getSortBy(); // 기본값 "qno"
		String orderBy = Optional.ofNullable(searchDTO.getOrderBy()).orElse("desc");
		String requestermid = JwtFilter.getMid();

		Sort sort = "asc".equalsIgnoreCase(orderBy) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

		Pageable pageable = PageRequest.of(page - 1, size, sort);

		Page<QuestionListDTO> questionList = questionService.findAll(searchDTO, pageable, requestermid);
		return ResponseEntity.ok(questionList);
	}

	// 상세 조회
	@GetMapping("/{qno}")
	public ResponseEntity<QuestionDetailDTO> detailQuestion(@PathVariable Long qno) {
		String requestermid = JwtFilter.getMid();

		QuestionDetailDTO questionDetail = questionService.getQuestion(qno, requestermid);
		return ResponseEntity.ok(questionDetail);
	}



	// 수정
	@PutMapping("/{qno}")
	public ResponseEntity<Void>	updateQuestion(
			@PathVariable Long qno, 
			@RequestBody QuestionUpdateDTO dto) {
		
		questionService.update(qno, dto);
		return ResponseEntity.noContent().build();
	}

	// 삭제
	@DeleteMapping("/{qno}")
	public ResponseEntity<?> deleteQuestion(@PathVariable Long qno,
			@RequestParam(required = false) String requesterMid) {
		questionService.delete(qno, requesterMid);
		return ResponseEntity.ok().build();
	}
	
	
	@GetMapping("/admin")
	@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
	public Page<AdminQnaDTO> getAdminQnaList(@ModelAttribute AdminQnaSearchDTO searchDTO, Pageable pageable) {
	    return adminQnaService.findAll(searchDTO, pageable, null);
	}
	
	
}
