package com.dglib.entity.book;

import java.time.LocalDate;
import java.util.List;

import com.dglib.entity.member.Member;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
public class InterestedBook {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ibId;
	
	
	@ToString.Exclude
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mid", nullable = false)
    @EqualsAndHashCode.Exclude
	private Member member;
	
	@ToString.Exclude
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "LibraryBookId", nullable = false)
    @EqualsAndHashCode.Exclude
	private LibraryBook libraryBook;
	
	
	
	
	
	

}
