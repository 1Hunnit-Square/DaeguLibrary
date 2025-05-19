package com.dglib.service.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;

public interface BookService {
	
	void registerBook(BookRegistrationDTO bookRegistrationDto);
	Page<BookSummaryDTO> getNsBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions, String mid);
	Page<BookSummaryDTO> getFsBookList(Pageable pageable, LibraryBookFsDTO libraryBookFsDTO, String mid);
	BookDetailDTO getLibraryBookDetail(Long libraryBookId, String mid);
	Page<RentalBookListDTO> getRentalList(Pageable pageable);
	void reserveBook(Long libraryBookId, String id);
	Page<ReserveBookListDTO> getReserveList(Pageable pageable);
	void cancelReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void reReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBorrowing(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBookReturn(List<RentalStateChangeDTO> rentalBookListDtos);
	Page<LibraryBookSearchByBookIdDTO> searchByLibraryBookBookId(Long libraryBookId, Pageable pageable);
	void rentBook(Long libraryBookId, String mno);
	BookRegistrationDTO getLibraryBookList(String isbn);
	void deleteLibraryBook(Long libraryBookId, String isbn);
	
	
     

}
