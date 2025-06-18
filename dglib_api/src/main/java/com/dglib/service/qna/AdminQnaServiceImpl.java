package com.dglib.service.qna;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.dglib.dto.qna.AdminQnaDTO;
import com.dglib.dto.qna.AdminQnaSearchDTO;
import com.dglib.entity.qna.Question;
import com.dglib.repository.qna.AdminQnaSpecifications;
import com.dglib.repository.qna.QuestionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class AdminQnaServiceImpl implements AdminQnaService {

	private final QuestionRepository questionRepository;
	private final ModelMapper modelMapper;

	@Override
	public Page<AdminQnaDTO> findAll(AdminQnaSearchDTO searchDTO, Pageable pageable, String requesterMid) {
	    Specification<Question> spec = AdminQnaSpecifications.search(searchDTO);
	    Page<Question> questionList = questionRepository.findAll(spec, pageable);

	    return questionList.map(question -> {
	        AdminQnaDTO dto = new AdminQnaDTO();
	        modelMapper.map(question, dto);

	        dto.setName(question.getMember().getName());

	        dto.setStatus(question.getAnswer() == null ? "접수" : "완료");

	        return dto;
	    });
	}

}
