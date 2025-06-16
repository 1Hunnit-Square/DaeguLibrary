package com.dglib.dto.book;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class ChatbotBookResponseDTO {
	
	String bookTitle;
	
	String author;
	
	boolean canBorrow;
	
	Map<String, String> callsignLocation;
	
	String isbn;
	
	Long allCount;
	
	Long count;
	

}
