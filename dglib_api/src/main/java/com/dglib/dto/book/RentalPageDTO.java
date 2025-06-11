package com.dglib.dto.book;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RentalPageDTO {
	
	Page<RentalBookListDTO> dto; 
	boolean isUpdate;
	
	

}
