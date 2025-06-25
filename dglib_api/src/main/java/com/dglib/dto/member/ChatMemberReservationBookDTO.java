package com.dglib.dto.member;

import lombok.Data;

@Data
public class ChatMemberReservationBookDTO {
	
	private String bookTitle;
	private String author;
	private int rank;
	private boolean isReturned;
	private boolean isUnmanned;
	

}
