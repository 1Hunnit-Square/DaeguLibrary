package com.dglib.service.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestParam;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.AdminWishBookListDTO;
import com.dglib.dto.book.AdminWishBookSearchDTO;
import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookNewSumDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.BookTopSumDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.dto.book.LibraryBookSummaryDTO;
import com.dglib.dto.book.NewLibrarayBookRequestDTO;
import com.dglib.dto.book.RegWishBookDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalPageDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.EbookRegistrationDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.KeywordDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.book.SearchBookDTO;
import com.dglib.entity.book.Keyword;

public interface BookService {
	
	void registerBook(BookRegistrationDTO bookRegistrationDto);
	SearchBookDTO getNsBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions, String mid);
	Page<BookSummaryDTO> getFsBookList(Pageable pageable, LibraryBookFsDTO libraryBookFsDTO, String mid);
	Page<BookNewSumDTO> getNewBookList(Pageable pageable, NewLibrarayBookRequestDTO newLibrarayBookRequesdto);
	BookDetailDTO getLibraryBookDetail(String mid, String isbn);
	RentalPageDTO getRentalList(Pageable pageable, BorrowedBookSearchDTO borrowedBookSearchDto);
	void reserveBook(Long libraryBookId, String id);
	Page<ReserveBookListDTO> getReserveList(Pageable pageable, BorrowedBookSearchDTO borrowedBookSearchDto);
	void cancelReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBorrowing(List<ReserveStateChangeDTO> reserveStateChangeDtos);
	void completeBookReturn(List<RentalStateChangeDTO> rentalBookListDtos);
	Page<LibraryBookSearchByBookIdDTO> searchByLibraryBookBookId(Long libraryBookId, Pageable pageable);
	void rentBook(Long libraryBookId, String mno);
	BookRegistrationDTO getLibraryBookList(String isbn);
	void changeLibraryBook(Long libraryBookId, String state);
	Page<LibraryBookSummaryDTO> getLibraryBookList(Pageable pageable, LibraryBookSearchDTO libraryBookSearchDto);
	void unMannedReserveBook(Long libraryBookId, String mid);
	void addInterestedBook(String mid, AddInterestedBookDTO addInteredtedBookDto);
	Page<InterestedBookResponseDTO> getInterestedBookList(Pageable pageable, InterestedBookRequestDTO interestedBookRequestDto, String mid);
	void deleteInterestedBook(InteresdtedBookDeleteDTO interesdtedBookDeleteDto, String mid);
	Page<BookTopSumDTO> getTopBorrowedBookList(Pageable pagebale, String check);
	void checkOverdue();
	void recordSearch(String keyword, String fingerprint);
	void updateTopBooksCache();
	void updatePopularKeywordCache();
	void deleteKeyword();
	void deleteKeywordFingerprint();
	void regWishBook(RegWishBookDTO dto, String mid);
	Page<AdminWishBookListDTO> getWishBookList(Pageable pageable, AdminWishBookSearchDTO dto);
	void rejectWishBook(Long wishno);
	void regEbook(EbookRegistrationDTO dto);
	
	
	
	
	
     

}
