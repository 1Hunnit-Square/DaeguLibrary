package com.dglib.entity.book;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "isbn", nullable = false)
	private Book book;
	
	@OneToMany(mappedBy = "libraryBook")
	private Set<Rental> rentals = new LinkedHashSet<>();
	
	@OneToMany(mappedBy = "libraryBook")
	@OrderBy("reserveDate ASC")
	private Set<Reserve> reserves  = new LinkedHashSet<>();

}
