package com.dglib.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.dglib.entity.book.Ebook;
import com.dglib.repository.book.EbookRepository;

@SpringBootTest
public class EbookRepositoryTest {

    @Autowired
    private EbookRepository ebookRepository;  

    @Test
    public void deleteEbookById() {
        Long targetId = 5L;

       
        Optional<Ebook> ebookOptional = ebookRepository.findById(targetId);
        assertThat(ebookOptional).isPresent();

       
        ebookRepository.deleteById(targetId);

      
        Optional<Ebook> deletedEbook = ebookRepository.findById(targetId);
        assertThat(deletedEbook).isNotPresent();
    }
}