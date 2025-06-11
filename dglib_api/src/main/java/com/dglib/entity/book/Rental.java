package com.dglib.entity.book;

import java.time.LocalDate;
import java.util.List;

import com.dglib.entity.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@Table(name = "rental", indexes = {
@Index(name = "idx_rental_state_duedate", columnList = "state,dueDate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long rentId;
	
	@Column(nullable = false)
	private LocalDate rentStartDate;
	
	@Column(nullable = false)
	private LocalDate dueDate;
	
	@Column(nullable = true)
	private LocalDate returnDate;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private RentalState state;
	
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
	
	public void changeState(RentalState newState) {
		if (this.state == newState) {
			throw new IllegalStateException("현재 상태와 동일한 상태로 변경할 수 없습니다.");
		}

		this.state = newState;
	}
	
	

}
