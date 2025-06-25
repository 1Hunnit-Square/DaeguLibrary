package com.dglib.dto.member;

import java.util.List;

import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class ChatMemberReservationResponseDTO {
	
	private MemberState state;
	
	private Long canReserveCount;
	
	private Long reservedCount;
	
	private Long overdueCount;
	
	private Long canBorrowCount;
	
	private List<ChatMemberReservationBookDTO> reservationBooks;

}
