package com.dglib.entity.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
	
	@Id
	@Column(length = 13)
	private String isbn;  // ISBN 0으로 시작 가능해서 String으로 설정
	
	@Column(nullable = false, length = 255)
	private String bookTitle;
	
	@Column(nullable = false, length = 255)
	private String author;
	
	@Column(nullable = false, length = 255)
	private String publisher;
	
	@Column(nullable = false)
	private LocalDate pubDate;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String description;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String cover;
	
	@OneToMany(mappedBy = "book")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
	private List<LibraryBook> libraryBooks;
	
	
	
	

}
