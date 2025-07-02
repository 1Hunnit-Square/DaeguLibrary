package com.dglib.entity.book;

import java.time.LocalDate;

import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryBook {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long libraryBookId;
	
	@Column(length = 30, nullable = false, unique = true)
	private String callSign;
	
	@Column(length = 10, nullable = false)
	private String location;
	
	@Column(nullable = false)
	private LocalDate regLibraryBookDate;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "isbn", nullable = false)
	private Book book;
	
	@Column(nullable = false)
	@Builder.Default
	private boolean isDeleted = false;
	
	
	@OneToMany(mappedBy = "libraryBook")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
    @BatchSize(size = 50)
	private Set<Rental> rentals;
	
	
	@OneToMany(mappedBy = "libraryBook")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
    @BatchSize(size = 50)
	private Set<Reserve> reserves;
	
	@OneToMany(mappedBy = "libraryBook")
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
    @BatchSize(size = 50)
	private List<InterestedBook> interestedBooks;
	
	

}
