package com.dglib.service.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;

public interface BookService {
	
	void registerBook(BookRegistrationDTO bookRegistrationDto);
	Page<BookSummaryDTO> getBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions);
	BookDetailDTO getLibraryBookDetail(Long libraryBookId);
	Page<RentalBookListDTO> getRentalList(Pageable pageable);
	void reserveBook(Long libraryBookId, String id);
	Page<ReserveBookListDTO> getReserveList(Pageable pageable);
	void cancelReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void reReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBorrowing(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBookReturn(List<RentalStateChangeDTO> rentalBookListDtos);
	Page<LibraryBookSearchByBookIdDTO> searchByLibraryBookBookId(Long libraryBookId, Pageable pageable);
	void rentBook(Long libraryBookId, String mno);
	
     

}
