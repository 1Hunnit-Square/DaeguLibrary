package com.dglib.entity.book;

import java.time.LocalDateTime;

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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserve {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long reserveId;
	
	@Column(nullable = false)
	private LocalDateTime reserveDate;
	
	@Column(nullable = true, columnDefinition = "boolean default false")
	private boolean isUnmanned;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ReserveState state;
	
	
	@ManyToOne(fetch = FetchType.LAZY)
	@ToString.Exclude
	@JoinColumn(name = "mid", nullable = false)
    @EqualsAndHashCode.Exclude
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@ToString.Exclude
	@JoinColumn(name = "LibraryBookId", nullable = false)
    @EqualsAndHashCode.Exclude
	private LibraryBook libraryBook;
	
	
	
	
	
	public void changeState(ReserveState newState) {
	    if (this.state == newState) {
	        throw new IllegalStateException("현재 상태와 동일한 상태로 변경할 수 없습니다.");
	    }
	   

	    this.state = newState;
	}
	
	

}
