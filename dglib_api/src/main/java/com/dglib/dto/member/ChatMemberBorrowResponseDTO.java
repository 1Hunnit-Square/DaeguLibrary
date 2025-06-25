package com.dglib.dto.member;

import com.dglib.entity.member.MemberState;

import lombok.Data;

@Data
public class ChatMemberBorrowResponseDTO {
	
	private Long borrowCount;
	private Long reservedCount;
	private Long overdueCount;
	private Long unmannedCount;
	private Long canBorrowCount;
	private Long canReserveCount;
	private MemberState state;

}
