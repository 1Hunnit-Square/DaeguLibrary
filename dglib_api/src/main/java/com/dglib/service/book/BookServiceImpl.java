package com.dglib.service.book;
import org.apache.commons.text.similarity.LevenshteinDistance;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.AdminWishBookListDTO;
import com.dglib.dto.book.AdminWishBookSearchDTO;
import com.dglib.dto.book.BookDTO;
import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookNewSumDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookStatusCountDto;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.BookTopSumDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookFsDTO;
import com.dglib.dto.book.LibraryBookResponseDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.LibraryBookSearchDTO;
import com.dglib.dto.book.LibraryBookSummaryDTO;
import com.dglib.dto.book.NewLibrarayBookRequestDTO;
import com.dglib.dto.book.PageSaveRequestDTO;
import com.dglib.dto.book.RegWishBookDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalPageDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.ChatbotTitleResponseDTO;
import com.dglib.dto.book.EbookListRequestDTO;
import com.dglib.dto.book.EbookMemberRequestDTO;
import com.dglib.dto.book.EbookMemberResponseDTO;
import com.dglib.dto.book.EbookRegistrationDTO;
import com.dglib.dto.book.EbookSearchDTO;
import com.dglib.dto.book.EbookSumDTO;
import com.dglib.dto.book.EbookSummaryDTO;
import com.dglib.dto.book.EbookUpdateDTO;
import com.dglib.dto.book.HighlightRequestDTO;
import com.dglib.dto.book.HighlightResponseDTO;
import com.dglib.dto.book.HighlightUpdateDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.KeywordDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.dto.book.SearchBookDTO;
import com.dglib.entity.book.Book;
import com.dglib.entity.book.Ebook;
import com.dglib.entity.book.EbookReadingProgress;
import com.dglib.entity.book.Highlight;
import com.dglib.entity.book.InterestedBook;
import com.dglib.entity.book.Keyword;
import com.dglib.entity.book.KeywordFingerprint;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.book.WishBook;
import com.dglib.entity.book.WishBookState;
import com.dglib.entity.member.Member;
import com.dglib.entity.member.MemberState;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.EbookReadingProgressRepository;
import com.dglib.repository.book.EbookRepository;
import com.dglib.repository.book.EbookSpecifications;
import com.dglib.repository.book.HighlightRepository;
import com.dglib.repository.book.InterestedBookRepository;
import com.dglib.repository.book.InterestedBookSpecifications;
import com.dglib.repository.book.KeywordRepository;
import com.dglib.repository.book.KeywordFingerprintRepository;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.repository.book.LibraryBookSpecifications;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.book.RentalSpecifications;
import com.dglib.repository.book.ReserveRepository;
import com.dglib.repository.book.ReserveSpecifications;
import com.dglib.repository.book.WishBookRepository;
import com.dglib.repository.book.WishBookSpecifications;
import com.dglib.repository.member.MemberRepository;
import com.dglib.service.member.MemberService;
import com.dglib.util.FileUtil;

import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class BookServiceImpl implements BookService {
	
	private final BookRepository bookRepository;
	private final ModelMapper modelMapper;
	private final LibraryBookRepository libraryBookRepository;
	private final RentalRepository rentalRepository;
	private final ReserveRepository reserveRepository;
	private final MemberRepository memberRepository;
	private final LevenshteinDistance  levenshtein;
	private final KeywordRepository keywordRepository;
	private final KeywordFingerprintRepository keywordFingerprintRepository;
	private final Logger LOGGER = LoggerFactory.getLogger(BookServiceImpl.class);
	private final MemberService memberService;
	private final WishBookRepository wishBookRepository;
	private final EbookRepository ebookRepository;
	private final HighlightRepository highlightRepository;
	private final EbookReadingProgressRepository ebookReadingProgressRepository;
	private final FileUtil fileUtil;
	
	private final Map<String, List<BookTopSumDTO>> topBooksCache = new ConcurrentHashMap<>();
	
	private List<String> popularKeywordsCache = new ArrayList<>();

	
	@Override
	public void registerBook(BookRegistrationDTO bookRegistrationDto) {
	    BookDTO bookDto = bookRegistrationDto.getBook();
	    List<LibraryBookDTO> libraryBooks = bookRegistrationDto.getLibraryBooks();
	    Map<String, Long> callSignCount = new HashMap<>();
	    for (LibraryBookDTO book : libraryBooks) {
	        String callSign = book.getCallSign();
	        callSignCount.put(callSign, callSignCount.getOrDefault(callSign, 0L) + 1);
	    }
	    List<String> duplicatesInRequest = callSignCount.entrySet().stream()
	            .filter(entry -> entry.getValue() > 1)
	            .map(Map.Entry::getKey)
	            .collect(Collectors.toList());
	            
	    if (!duplicatesInRequest.isEmpty()) {
	        throw new IllegalStateException("요청 내에 중복된 청구번호가 존재합니다: " + duplicatesInRequest);
	    }
	    
	    Book bookEntity = bookRepository.findById(bookDto.getIsbn())
	    	    .map(existingBook -> {
	    	        modelMapper.map(bookDto, existingBook);
	    	        return bookRepository.save(existingBook);
	    	    })
	    	    .orElseGet(() -> {
	    	        Book newBook = modelMapper.map(bookDto, Book.class);
	    	        return bookRepository.save(newBook);
	    	    });
	    
	    List<Long> allLibraryBookIds = libraryBooks.stream()
	            .map(LibraryBookDTO::getLibraryBookId)
	            .collect(Collectors.toList());
	    
	    
	    List<Long> existingLibraryBookIds = libraryBookRepository.findExistingLibraryBookIds(allLibraryBookIds);
	    
	    
	    List<LibraryBookDTO> newLibraryBooks = new ArrayList<>();
	    List<LibraryBookDTO> existingLibraryBooks = new ArrayList<>();
	    
	    for (LibraryBookDTO dto : libraryBooks) {
	        if (existingLibraryBookIds.contains(dto.getLibraryBookId())) {
	            existingLibraryBooks.add(dto);
	        } else {
	            newLibraryBooks.add(dto);
	        }
	    }
	    
	   
	    if (!newLibraryBooks.isEmpty()) {
	        List<String> newCallSigns = newLibraryBooks.stream()
	                .map(LibraryBookDTO::getCallSign)
	                .collect(Collectors.toList());
	                
	        List<String> duplicateCallSigns = libraryBookRepository.findExistingCallSignsExcludeIds(
	                newCallSigns, existingLibraryBookIds);
	                
	        if (!duplicateCallSigns.isEmpty()) {
	            throw new IllegalStateException("이미 존재하는 청구번호입니다.: " + duplicateCallSigns);
	        }
	    }
	    
	    
	    if (!existingLibraryBooks.isEmpty()) {
	        
	        List<LibraryBook> existingEntities = libraryBookRepository.findAllById(existingLibraryBookIds);
	        Map<Long, LibraryBook> existingEntityMap = existingEntities.stream()
	                .collect(Collectors.toMap(LibraryBook::getLibraryBookId, entity -> entity));
	        
	       
	        Map<Long, String> changedCallSigns = new HashMap<>(); 
	        
	        
	        for (LibraryBookDTO dto : existingLibraryBooks) {
	            LibraryBook entity = existingEntityMap.get(dto.getLibraryBookId());
	            if (entity != null && !entity.getCallSign().equals(dto.getCallSign())) {
	                changedCallSigns.put(dto.getLibraryBookId(), dto.getCallSign());
	            } 
	        }
	        
	        
	        if (!changedCallSigns.isEmpty()) {
	            List<String> callSignsToCheck = new ArrayList<>(changedCallSigns.values());
	            List<Long> excludeIds = new ArrayList<>(changedCallSigns.keySet());
	            List<String> duplicates = libraryBookRepository.findExistingCallSignsExcludeIds(
	                    callSignsToCheck, excludeIds);
	                    
	            if (!duplicates.isEmpty()) {
	                throw new IllegalStateException("이미 존재하는 청구번호입니다.: " + duplicates);
	            }
	        }
	        
	        
	        for (LibraryBookDTO dto : existingLibraryBooks) {
	            LibraryBook entity = existingEntityMap.get(dto.getLibraryBookId());
	            if (entity != null) {
	            	boolean isDeleted = entity.isDeleted();
	                modelMapper.map(dto, entity);
	                entity.setDeleted(isDeleted); 
	                entity.setBook(bookEntity);
	                
	            }
	        }
	        
	        libraryBookRepository.saveAll(existingEntities);
	    }
	    
	    if (!newLibraryBooks.isEmpty()) {
	        List<LibraryBook> newLibraryBookEntities = newLibraryBooks.stream()
	                .map(dto -> {
	                    LibraryBook entity = modelMapper.map(dto, LibraryBook.class);
	                    entity.setBook(bookEntity);
	                    entity.setRegLibraryBookDate(LocalDate.now());
	                    return entity;
	                })
	                .collect(Collectors.toList());
	                
	        libraryBookRepository.saveAll(newLibraryBookEntities);
	    }
	    
		WishBook wishbook = wishBookRepository.findByIsbnAndState(bookDto.getIsbn(), WishBookState.APPLIED).orElse(null);
		if (wishbook != null) {
			wishbook.setState(WishBookState.ACCEPTED);
			wishbook.setProcessedAt(LocalDate.now());
		}
	}
	
	public void updatePopularKeywordCache() {
        List<String> keywords = keywordRepository.findTop5ByOrderBySearchCountDesc()
            .stream()
            .map(Keyword::getKeyword)
            .collect(Collectors.toList());
        
        this.popularKeywordsCache = keywords;
        LOGGER.info("인기 검색어 캐시 업데이트 완료: {}", keywords);
    }
	

	@Override
	@Transactional(readOnly = true)
	public SearchBookDTO getNsBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions, String mid) {
		Specification<LibraryBook> spec = null;
		spec = LibraryBookSpecifications.research(query, option, previousQueries, previousOptions);    
        Page<LibraryBook> libraryBooks = libraryBookRepository.findAll(spec, pageable);
        Page<BookSummaryDTO> bookSummaryPage = libraryBooks.map(libraryBook -> toBookSummaryDTO(libraryBook, mid));
        List<String> keywords;
        if (popularKeywordsCache.isEmpty()) {
            LOGGER.info("인기 검색어 캐시가 비어있습니다.");
            keywords = keywordRepository.findTop5ByOrderBySearchCountDesc()
                    .stream()
                    .map(Keyword::getKeyword)
                    .collect(Collectors.toList());
            this.popularKeywordsCache = keywords;
        } else {
            keywords = popularKeywordsCache;
        }
        
        return new SearchBookDTO(bookSummaryPage, keywords);
	}
        
	@Override
	@Transactional(readOnly = true)
	public Page<BookSummaryDTO> getFsBookList(Pageable pageable, LibraryBookFsDTO libraryBookFsDTO, String mid) {
		Specification<LibraryBook> spec = LibraryBookSpecifications.fsFilter(libraryBookFsDTO);
		Page<LibraryBook> libraryBooks = libraryBookRepository.findAll(spec, pageable);
		
		return libraryBooks.map(libraryBook -> toBookSummaryDTO(libraryBook, mid));
	}
	
	@Override
    @Transactional(readOnly = true)
	public Page<BookNewSumDTO> getNewBookList(Pageable pageable, NewLibrarayBookRequestDTO newLibrarayBookRequesdto) {
		Page<LibraryBook> libraryBooks = libraryBookRepository.findFirstRegisteredBooksByDateBetween(newLibrarayBookRequesdto.getStartDate(), newLibrarayBookRequesdto.getEndDate(), pageable);
		return libraryBooks.map(libraryBook -> {
		BookNewSumDTO dto = modelMapper.map(libraryBook.getBook(), BookNewSumDTO.class);
		dto.setLibraryBookId(libraryBook.getLibraryBookId());
        return dto;});
	}
	
	
	@Override
	public void updateTopBooksCache() {
        Arrays.asList("오늘", "일주일", "한달").forEach(period -> {
            List<BookTopSumDTO> topBooks = calculateTopBooksForPeriod(period);
            topBooksCache.put(period, topBooks);
        });
    }
	
	
	@Override
    @Transactional(readOnly = true)
    public Page<BookTopSumDTO> getTopBorrowedBookList(Pageable pageable, String check) {
        List<BookTopSumDTO> allBooks = topBooksCache.getOrDefault(check, new ArrayList<>());
        
        if (allBooks.isEmpty()) {
            LOGGER.info("캐시가 비어있음");
            allBooks = calculateTopBooksForPeriod(check);
        }
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allBooks.size());
        List<BookTopSumDTO> pagedBooks = allBooks.subList(start, end);
        
        return new PageImpl<>(pagedBooks, pageable, allBooks.size());
    }

	
	@Override
	@Transactional(readOnly = true)
	public BookDetailDTO getLibraryBookDetail(String mid, String isbn) {
		LibraryBook libraryBook;
		libraryBook = libraryBookRepository.findFirstByBookIsbnAndIsDeletedFalse(isbn)
					.orElse(null);
		
		
		if (libraryBook == null) {
	        return new BookDetailDTO();
	    }
	    BookDetailDTO dto = new BookDetailDTO();
	    
	    
	    List<LibraryBookResponseDTO> libraryBooks = libraryBook.getBook().getLibraryBooks().stream().filter(lb -> !lb.isDeleted())
	    	    .map(lb -> {
	    	        LibraryBookResponseDTO lbDto = new LibraryBookResponseDTO();
	    	        modelMapper.map(lb, lbDto);
	    	        boolean isReserved = lb.getReserves().stream()
	    	        		.anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED);
	    	        lbDto.setReserved(isReserved);
	    	        boolean isBorrowed = lb.getRentals().stream()
	    					.anyMatch(rental -> rental.getState() == RentalState.BORROWED);
	    	        lbDto.setBorrowed(isBorrowed);
	    			boolean isOverDue = lb.getRentals().stream()
	    					.anyMatch(rental -> rental.getState() == RentalState.BORROWED
	    							&& LocalDate.now().isAfter(rental.getDueDate()));
	    			lbDto.setOverdue(isOverDue);
	    			int reserveCount = (int) lb.getReserves().stream()
	    					.filter(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false ).count();
	    			lbDto.setReserveCount(reserveCount);
	    			lbDto.setDueDate(lb.getRentals().stream().filter(rental -> rental.getState() == RentalState.BORROWED)
	    					.findFirst().map(Rental::getDueDate).orElse(null));
	    			boolean isUnmanned = lb.getReserves().stream()
	    					.anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true);
	    			lbDto.setUnmanned(isUnmanned);
	    	        return lbDto;
	    	    })
	    	    .collect(Collectors.toList());
	    modelMapper.map(libraryBook.getBook(), dto);
	    modelMapper.map(libraryBook, dto);
	    dto.setLibraryBooks(libraryBooks);
	    return dto;
	}
	
	@Override
	@Transactional(readOnly = true)
	public RentalPageDTO getRentalList(Pageable pageable, BorrowedBookSearchDTO borrowedBookSearchDto) {
		boolean isMemberOverdueUpdated = memberService.isLastSuccessOverdueCheckDateToday();
		Specification<Rental> spec = RentalSpecifications.rsFilter(borrowedBookSearchDto);
		Page<RentalBookListDTO> rentalList = rentalRepository.findAll(spec, pageable).map(rental -> {
			RentalBookListDTO dto = new RentalBookListDTO();
			modelMapper.map(rental.getLibraryBook(), dto);
			modelMapper.map(rental.getLibraryBook().getBook(), dto);
			modelMapper.map(rental.getMember(), dto);
			modelMapper.map(rental, dto);
			return dto;
		});
		return new RentalPageDTO(rentalList, isMemberOverdueUpdated);
	}
	
	@Override
	public void reserveBook(Long libraryBookId, String mid) {
	    reserveBookCommon(libraryBookId, mid, false);
	}

	@Override
	public void unMannedReserveBook(Long libraryBookId, String mid) {
	    reserveBookCommon(libraryBookId, mid, true);
	}
	
	@Override
	@Transactional(readOnly = true)
	public Page<ReserveBookListDTO> getReserveList(Pageable pageable, BorrowedBookSearchDTO borrowedBookSearchDto) {
		Specification<Reserve> spec = ReserveSpecifications.rsFilter(borrowedBookSearchDto);
	    Page<Reserve> reserveList = reserveRepository.findAll(spec, pageable);
	    Map<Long, List<Reserve>> bookReservationsMap = new HashMap<>();
	    List<Rental> overdueRentals = rentalRepository.findOverdueRentals(LocalDate.now());
	    
	    return reserveList.map(reserve -> {
	        ReserveBookListDTO dto = new ReserveBookListDTO();
	        LibraryBook libraryBook = reserve.getLibraryBook();
	        String mid = reserve.getMember().getMid();
            boolean isOverdue = overdueRentals.stream()
            	    .anyMatch(rental -> rental.getMember().getMid().equals(mid)); 
	        modelMapper.map(libraryBook, dto);
	        modelMapper.map(libraryBook.getBook(), dto);
	        modelMapper.map(reserve.getMember(), dto);
	        modelMapper.map(reserve, dto);
	        if(isOverdue) {
	        	dto.setOverdue(true);
	        }
	        Integer rank = null;
	        if (reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false) {
	            List<Reserve> reservedOnlyList = bookReservationsMap.computeIfAbsent(
	                libraryBook.getLibraryBookId(), 
	                k -> libraryBook.getReserves().stream()
	                    .filter(r -> r.getState() == ReserveState.RESERVED && r.isUnmanned() == false)
	                    .sorted(Comparator.comparing(Reserve::getReserveDate))
	                    .collect(Collectors.toList())
	            );
	            for (int i = 0; i < reservedOnlyList.size(); i++) {
	                if (reservedOnlyList.get(i).getReserveId().equals(reserve.getReserveId())) {
	                    rank = i + 1;
	                    break;
	                }
	            }
	        }
	        dto.setReservationRank(rank);
	        return dto;
	    });
	}
	
	@Override
	public void cancelReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos) {
	    List<Long> reserveIds = reserveStateChangeDtos.stream()
	            .map(ReserveStateChangeDTO::getReserveId)
	            .collect(Collectors.toList());
	    List<Reserve> reserves = reserveRepository.findAllById(reserveIds);    
	    Map<Long, Reserve> reserveMap = reserves.stream()
	            .collect(Collectors.toMap(Reserve::getReserveId, reserve -> reserve));
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Reserve reserve = reserveMap.get(dto.getReserveId());
	        if (reserve == null) {
	            throw new IllegalStateException("해당 예약 정보를 찾을 수 없습니다.");
	        }
	        if (reserve.getState() == ReserveState.BORROWED) {
	            throw new IllegalStateException("이미 대출 완료된 예약입니다.");
	        }
	        reserve.changeState(ReserveState.CANCELED);
	        
	    }
	}
	
	
	@Override
	public void completeBorrowing(List<ReserveStateChangeDTO> reserveStateChangeDtos) {
	    List<Long> reserveIds = reserveStateChangeDtos.stream()
	            .map(ReserveStateChangeDTO::getReserveId)
	            .collect(Collectors.toList());
	    
	    List<Reserve> reserves = reserveRepository.findAllByIdInWithDetails(reserveIds);
	    Map<Long, Reserve> reserveMap = reserves.stream()
	            .collect(Collectors.toMap(Reserve::getReserveId, reserve -> reserve));
	    
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Reserve reserve = reserveMap.get(dto.getReserveId());
	        if (reserve == null) {
	            throw new IllegalStateException("해당 예약 정보를 찾을 수 없습니다.");
	        }
	        if (reserve.getState() == ReserveState.CANCELED) {
	            throw new IllegalStateException("취소된 예약은 대출 완료로 변경할 수 없습니다.");
	        }
	    }
	    
	
	    Set<Long> libraryBookIds = reserves.stream()
	            .map(reserve -> reserve.getLibraryBook().getLibraryBookId())
	            .collect(Collectors.toSet());
	    

	    Map<Long, List<Reserve>> reservesByLibraryBook = reserveRepository
	    		.findByLibraryBookLibraryBookIdInAndStateOrderByReserveDateAsc(libraryBookIds, ReserveState.RESERVED)
	            .stream()
	            .collect(Collectors.groupingBy(reserve -> reserve.getLibraryBook().getLibraryBookId()));
	    
	
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Reserve reserve = reserveMap.get(dto.getReserveId());
	        Long libraryBookId = reserve.getLibraryBook().getLibraryBookId();
	        

	        List<Reserve> bookReserves = reservesByLibraryBook.get(libraryBookId);
	        int reservationRank = 1;
	        for (Reserve bookReserve : bookReserves) {
	            if (!bookReserve.isUnmanned()) {
	                if (bookReserve.getReserveId().equals(dto.getReserveId())) {
	                    break;
	                }
	                reservationRank++;
	            }
	        }
	        
	        if (reservationRank > 1) {
	            throw new IllegalStateException("예약 우선 순위가 충족되지 않아 대출을 완료할 수 없습니다.");
	        }
	    }
	    
	    List<Long> distinctLibraryBookIds = new ArrayList<>(libraryBookIds);
	    List<Long> borrowedLibraryBookIds = rentalRepository.findBorrowedLibraryBookIdsIn(distinctLibraryBookIds);
	    

	    List<Rental> overdueRentals = rentalRepository.findOverdueRentals(LocalDate.now());
	    Set<String> overdueMemberIds = overdueRentals.stream()
	            .map(rental -> rental.getMember().getMid())
	            .collect(Collectors.toSet());
	    
	    List<Rental> rentalsToCreate = new ArrayList<>();
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Reserve reserve = reserveMap.get(dto.getReserveId());
	        

	        if (borrowedLibraryBookIds.contains(reserve.getLibraryBook().getLibraryBookId())) {
	            throw new IllegalStateException("이미 대출 중인 도서입니다.");
	        }
	        

	        String mid = reserve.getMember().getMid();
	        if (overdueMemberIds.contains(mid)) {
	            throw new IllegalStateException("연체된 도서가 있어 대출할 수 없습니다. 연체중인 회원 ID: " + mid);
	        }

	        reserve.changeState(ReserveState.BORROWED);
	        

	        Rental rental = new Rental();
	        rental.setLibraryBook(reserve.getLibraryBook());
	        rental.setMember(reserve.getMember());
	        rental.setRentStartDate(LocalDate.now());
	        rental.setDueDate(LocalDate.now().plusDays(7));
	        rental.setState(RentalState.BORROWED);
	        
	        rentalsToCreate.add(rental);
	    }
	    
	    rentalRepository.saveAll(rentalsToCreate);
	}
	
	
	@Override
	public void completeBookReturn(List<RentalStateChangeDTO> rentalStateChangeDtos) {
		List<Long> rentIds = rentalStateChangeDtos.stream()
                .map(RentalStateChangeDTO::getRentId)
                .collect(Collectors.toList());
		List<Rental> rentals = rentalRepository.findAllById(rentIds);
		Map<Long, Rental> rentMap = rentals.stream()
			       .collect(Collectors.toMap(Rental::getRentId, reserve -> reserve));
		for (RentalStateChangeDTO dto : rentalStateChangeDtos) {
			Rental rental = rentMap.get(dto.getRentId());
			if (rental == null) {
				throw new IllegalStateException("해당 대출 정보를 찾을 수 없습니다.");
			}
			if (rental.getState() == RentalState.RETURNED) {
				throw new IllegalStateException("이미 반납 완료된 도서입니다.");
			}
		}
		for (RentalStateChangeDTO dto : rentalStateChangeDtos) {
			Long rentId = dto.getRentId();
			Rental rental = rentMap.get(rentId);
			rental.changeState(RentalState.RETURNED);
			rental.setReturnDate(LocalDate.now());
		}
	
	}
	
	@Override
	public Page<LibraryBookSearchByBookIdDTO> searchByLibraryBookBookId(Long libraryBookId, Pageable pageable) {
		return libraryBookRepository.findBookByLibraryBookId(libraryBookId, pageable);
	}
	
	@Override
	public void rentBook(Long libraryBookId, String mno) {
		LOGGER.info("대출이 무한대면 얼마나 좋을까");
		LOGGER.info(mno);
		LibraryBook libraryBook = libraryBookRepository.findByLibraryBookId(libraryBookId).orElse(null);
		Member member = memberRepository.findByMno(mno).orElse(null);
		LOGGER.info(member + "");
		BookStatusCountDto countDto = libraryBookRepository.countReserveAndBorrowDto(mno, ReserveState.RESERVED, RentalState.BORROWED);
		LOGGER.info("대출예약현황" + countDto);
		if (countDto.getReserveCount() + countDto.getBorrowCount() >= 5) {
			throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 대출중인 도서 : " + countDto.getBorrowCount() + ", 예약중인 도서 : " + countDto.getReserveCount());
		}
		if (libraryBook.getReserves().stream().anyMatch(r -> r.getState() == ReserveState.RESERVED)) {
			throw new IllegalStateException("예약된 도서입니다.");
		}
		if (libraryBook.getRentals().stream().anyMatch(r -> r.getState() == RentalState.BORROWED)) {
            throw new IllegalStateException("대출중인 도서입니다.");
        }
		if (member.getState() == MemberState.OVERDUE && member.getPenaltyDate() != null && member.getPenaltyDate().isAfter(LocalDate.now())) {
			throw new IllegalStateException("연체 패널티로 인해 대출할 수 없습니다.");
		}
		if (member.getState() == MemberState.PUNISH) {
			throw new IllegalStateException("제재 회원은 대출할 수 없습니다.");
		}
		Rental rental = new Rental();
		rental.setLibraryBook(libraryBook);
		rental.setMember(member);
		rental.setRentStartDate(LocalDate.now());
		rental.setDueDate(LocalDate.now().plusDays(7));
		rental.setState(RentalState.BORROWED);
		rentalRepository.save(rental);		
	}
	
	@Override
	public BookRegistrationDTO getLibraryBookList(String isbn) {
		Book book = bookRepository.findByIsbn(isbn);
		BookRegistrationDTO bookRegistrationDTO = new BookRegistrationDTO();
		if (book != null) {
			BookDTO bookDTO = modelMapper.map(book, BookDTO.class);
			List<LibraryBookDTO> libraryBookDTOs = book.getLibraryBooks().stream()
	                .map(libraryBook -> modelMapper.map(libraryBook, LibraryBookDTO.class))
	                .collect(Collectors.toList());
			bookRegistrationDTO = new BookRegistrationDTO();
			bookRegistrationDTO.setBook(bookDTO);
			bookRegistrationDTO.setLibraryBooks(libraryBookDTOs);
		}
		
		

		
		return bookRegistrationDTO;
		
	}
	
	@Override
	public void changeLibraryBook(Long libraryBookId, String state) {
		
		LibraryBook libraryBook = libraryBookRepository.findWithDetailsByLibraryBookId(libraryBookId)
				.orElseThrow(() -> new EntityNotFoundException("해당 도서관 도서를 찾을 수 없습니다."));
		if (libraryBook.isDeleted() && state.equals("부재")) {
			throw new IllegalStateException("이미 부재처리 된 도서입니다.");
		}
		if (!libraryBook.isDeleted() && state.equals("소장중")) {
			throw new IllegalStateException("이미 소장중인 도서입니다.");
		}
		
		if (state.equals("부재")) {
			libraryBook.getRentals().stream().filter(rental -> rental.getState() == RentalState.BORROWED)
					.forEach(rental -> rental.setState(RentalState.RETURNED));
			libraryBook.getReserves().stream().filter(reserve -> reserve.getState() == ReserveState.RESERVED)
					.forEach(reserve -> reserve.setState(ReserveState.CANCELED));
		}
		
		libraryBook.setDeleted(!(libraryBook.isDeleted()));
		
		if (!libraryBook.isDeleted()) {
			WishBook wishBook = wishBookRepository.findByIsbnAndState(libraryBook.getBook().getIsbn(), WishBookState.APPLIED).orElse(null);
			if (wishBook != null) {
				wishBook.setState(WishBookState.ACCEPTED);
				wishBook.setProcessedAt(LocalDate.now());
			}
		} 
		
	}
	

	
	@Override
	public Page<LibraryBookSummaryDTO> getLibraryBookList(Pageable pageable, LibraryBookSearchDTO libraryBookSearchDto) {
		Specification<LibraryBook> spec = LibraryBookSpecifications.lsFilter(libraryBookSearchDto);
	    Page<LibraryBook> bookList = libraryBookRepository.findAll(spec, pageable);
		
		return bookList.map(book -> {
			LibraryBookSummaryDTO dto = new LibraryBookSummaryDTO();
			modelMapper.map(book.getBook(), dto);
			modelMapper.map(book, dto);
			dto.setRented(book.getRentals().stream().anyMatch(rental -> rental.getState() == RentalState.BORROWED));
			dto.setUnmanned(book.getReserves().stream().anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true));
			dto.setReserveCount((int) book.getReserves().stream()
				    .filter(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false)
				    .count());
			return dto;
		});
	}
	
    
    
    @Override
    public void checkOverdue() {
		List<Rental> overdueRentals = rentalRepository.findOverdueRentals(LocalDate.now());
		Map<Member, Long> overdueCountByMember = overdueRentals.stream().collect(Collectors.groupingBy(Rental::getMember, Collectors.counting()));
		overdueCountByMember.forEach((member, count) -> {
			LOGGER.info("Member ID: {}, Overdue Count: {}", member.getMid(), count);
			member.setPenaltyDate(LocalDate.now().plusDays(count -1));
			member.setState(MemberState.OVERDUE);
		List<Member> releasedMember =  memberRepository.findMembersWithPenaltyDateButNotOverdue();
		releasedMember.forEach(m -> {
			m.setPenaltyDate(null);
			m.setState(MemberState.NORMAL);
		});
		});	
		
		
    }
    
    @Override
    public void recordSearch(String keyword, String fingerprint) {
    	LOGGER.info("Recording search for keyword: {}, sessionId: {}", keyword, fingerprint);
    	boolean alreadySearched = keywordFingerprintRepository.existsByFingerprintAndKeywordAndSearchDateAfter(fingerprint, keyword, LocalDateTime.now().minusMinutes(5));
		if (alreadySearched) {
			return;
		}
    		              
		Keyword searchKeyword = keywordRepository.findById(keyword).orElseGet(() -> {
			Keyword newKeyword = new Keyword();
			newKeyword.setKeyword(keyword);
			newKeyword.setSearchCount(0L);
			newKeyword.setLastSearchDate(LocalDate.now());
			return keywordRepository.save(newKeyword);
		});
		searchKeyword.setSearchCount(searchKeyword.getSearchCount() + 1L);
		searchKeyword.setLastSearchDate(LocalDate.now());
		keywordFingerprintRepository.save(KeywordFingerprint.builder().keyword(keyword).fingerprint(fingerprint).searchDate(LocalDateTime.now()).build());
		
    }
    
    @Override
    public void deleteKeyword() {
 
    	keywordRepository.deleteByLastSearchDateBefore(LocalDate.now().minusWeeks(1));
    }
    
    @Override
	public void deleteKeywordFingerprint() {
		keywordFingerprintRepository.deleteAll();
	}
    
    @Override
    public void regWishBook(RegWishBookDTO dto, String mid) {
    	boolean isAlreadyExist = libraryBookRepository.existsByBookIsbnAndIsDeletedFalse(dto.getIsbn());
		if (isAlreadyExist) {
			throw new IllegalStateException("이미 소장중인 도서입니다.");
		}
		LocalDate  startOfYear = LocalDate.now().withMonth(1).withDayOfMonth(1);
		LocalDate  endOfYear = LocalDate.now().withMonth(12).withDayOfMonth(31);
		Member member = memberRepository.findById(mid).orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));
    	Long appCount = wishBookRepository.countByMidAndAppliedAtBetween(mid, startOfYear, endOfYear, WishBookState.CANCELED);
		if (appCount >= 5) {
			throw new IllegalStateException("이미 5권의 희망 도서를 신청했습니다.");
		}
		boolean isAlreadyApp = wishBookRepository.existsByIsbnAndStateNotTwo(dto.getIsbn(), WishBookState.REJECTED, WishBookState.CANCELED);
		if (isAlreadyApp) {
			throw new IllegalStateException("이미 신청된 도서입니다.");
		}
		boolean isValid = dto.getIsbn() != null || StringUtils.hasText(dto.getNote());
		if (!isValid) {
			throw new IllegalArgumentException("ISBN 또는 비고를 입력해야 합니다.");
		}
		
		WishBook wishBook = modelMapper.map(dto, WishBook.class);
		wishBook.setState(WishBookState.APPLIED);
		wishBook.setAppliedAt(LocalDate.now());
		wishBook.setMember(member);
		wishBookRepository.save(wishBook);
    }
    
    @Override
    public Page<AdminWishBookListDTO> getWishBookList(Pageable pageable, AdminWishBookSearchDTO dto) {
    	Specification<WishBook> spec = WishBookSpecifications.wsFilter(dto);
    	Page<WishBook> wishBooks = wishBookRepository.findAll(spec, pageable);
		return wishBooks.map(wishBook -> {
			AdminWishBookListDTO adminWishBookListDTO = new AdminWishBookListDTO();
			modelMapper.map(wishBook, adminWishBookListDTO);
			adminWishBookListDTO.setMid(wishBook.getMember().getMid());
			return adminWishBookListDTO;
		});
    }
    
    @Override
    public void rejectWishBook(Long wishno) {
		WishBook wishBook = wishBookRepository.findById(wishno)
				.orElseThrow(() -> new EntityNotFoundException("해당 희망 도서 정보를 찾을 수 없습니다."));
		if (wishBook.getState() == WishBookState.REJECTED) {
			throw new IllegalStateException("이미 거절된 도서입니다.");
		}
		if (wishBook.getState() == WishBookState.ACCEPTED) {
			throw new IllegalStateException("이미 승인된 도서입니다.");
		}
		if (wishBook.getState() == WishBookState.CANCELED) {
			throw new IllegalStateException("이미 취소된 도서입니다.");
		}
		wishBook.setState(WishBookState.REJECTED);
		wishBook.setProcessedAt(LocalDate.now());
		wishBookRepository.save(wishBook);
    }
    
    @Override
    public void regEbook(EbookRegistrationDTO dto) {
    	
    	boolean isExist = ebookRepository.existsByEbookIsbn(dto.getEbookIsbn());
    	if (isExist) {
    		throw new IllegalStateException("이미 등록된 전자책입니다.");
    	}
    	Ebook ebook = modelMapper.map(dto, Ebook.class);
    	ebook.setEbookRegDate(LocalDate.now());
    	
    	
    	
    	
		if (dto.getEbookFile() == null) {
			throw new IllegalArgumentException("전자책 파일을 업로드해야 합니다.");
		}
		try {
			String uniqueFolderName = UUID.randomUUID().toString();
	        String path = "ebook/" + uniqueFolderName;
			List<MultipartFile> files = new ArrayList<>();
			if (dto.getEbookCover() != null) files.add(dto.getEbookCover());
			if (dto.getEbookFile() != null) files.add(dto.getEbookFile());
			List<Object> savedFileInfos = fileUtil.saveFiles(files, path);
			LOGGER.info("저장된 파일 정보: {}", savedFileInfos);
			for (Object savedFileInfo : savedFileInfos) {
	            Map<String, String> fileInfo = (Map<String, String>) savedFileInfo;
	            String originName = fileInfo.get("originalName");
	            String pathName = fileInfo.get("filePath");
	            
	            if (fileUtil.isImageFile(originName)) {
	                ebook.setEbookCover(pathName);
	                LOGGER.info("전자책 표지 이미지 경로: {}", pathName);
	            } else {
	                ebook.setEbookFilePath(pathName);
	                LOGGER.info("전자책 파일 경로: {}", pathName);
	            }
	        }
			
			ebookRepository.save(ebook);
	        
		} catch (Exception e) {
			LOGGER.error("전자책 파일 저장 실패: {}", e.getMessage());
			throw new IllegalStateException("전자책 파일 저장 실패: " + e.getMessage());
			
		}
	
		
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<EbookSumDTO> getEbookList(EbookListRequestDTO dto) {
    	int page = dto.getPage() > 0 ? dto.getPage() : 1;
    	int size = dto.getSize() > 0 ? dto.getSize() : 10;
    	Pageable pageable = PageRequest.of(page - 1, size, Sort.by("ebookId").descending());
    	Specification<Ebook> spec = EbookSpecifications.elFilter(dto);
    	Page<Ebook> ebookPage = ebookRepository.findAll(spec, pageable);
		return ebookPage.map(ebook -> {
			EbookSumDTO ebookSumDTO = new EbookSumDTO();
			modelMapper.map(ebook, ebookSumDTO);
			return ebookSumDTO;
		});
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HighlightResponseDTO> getHighlights(String mid, Long ebookId) {
    	List<Highlight> highlights = highlightRepository.findByMemberMidAndEbookEbookIdOrderByCreatedAtAsc(mid, ebookId);
		return highlights.stream().map(highlight -> {
			HighlightResponseDTO dto = new HighlightResponseDTO();
			modelMapper.map(highlight, dto);
			return dto;
		}).collect(Collectors.toList());
    }
    
    @Override
    public void addHighlight(String mid, HighlightRequestDTO requestDto) {
		Member member = memberRepository.findById(mid)
				.orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다."));
		Ebook ebook = ebookRepository.findById(requestDto.getEbookId())
				.orElseThrow(() -> new EntityNotFoundException("해당 전자책을 찾을 수 없습니다."));

		Optional<Highlight> existing = highlightRepository.findByMemberMidAndEbookEbookIdAndKey(mid, requestDto.getEbookId(), requestDto.getKey());
		if (existing.isPresent()) {
			throw new IllegalStateException("이미 존재하는 책갈피입니다.");
		}
		
		Highlight highlight = new Highlight();
		modelMapper.map(requestDto, highlight);
		highlight.setMember(member);
		highlight.setEbook(ebook);
		highlight.setCreatedAt(LocalDateTime.now());
		highlight.setUpdatedAt(LocalDateTime.now());
		highlightRepository.save(highlight);
    }
    
    @Override
    public void updateHighlight(String mid, HighlightUpdateDTO dto) {
    	Highlight highlight = highlightRepository.findById(dto.getHighlightId()).orElseThrow(() -> new EntityNotFoundException("해당 책갈피를 찾을 수 없습니다."));
		if (!highlight.getMember().getMid().equals(mid)) {
			throw new IllegalStateException("해당 책갈피를 수정할 권한이 없습니다.");
		}
		if (highlight.getColor().equals(dto.getColor())) {
			throw new IllegalStateException("동일한 색상입니다.");
		}
		
		highlight.setColor(dto.getColor());
		highlight.setUpdatedAt(LocalDateTime.now());
		
    }
    
    @Override
    public void deleteHighlight(String mid, Long highlightId) {
    	Highlight highlight = highlightRepository.findById(highlightId).orElseThrow(() -> new EntityNotFoundException("해당 책갈피를 찾을 수 없습니다."));
	        if (!highlight.getMember().getMid().equals(mid)) {
	        	  throw new IllegalStateException("해당 책갈피를 삭제할 권한이 없습니다.");
	        }
	        highlightRepository.delete(highlight);
    }
    
    @Override
    @Transactional(readOnly = true)
    public String getSavedPage(String mid, Long ebookId) {
    	EbookReadingProgress progress = ebookReadingProgressRepository.findByMemberMidAndEbookEbookId(mid, ebookId).orElse(null);
    	if (progress == null) {
            return null; 
        }
		return progress.getStartCfi();
    }
    
    @Override
    public void savePage(String mid, PageSaveRequestDTO dto) {
    	EbookReadingProgress progress = ebookReadingProgressRepository
    	        .findByMemberMidAndEbookEbookId(mid, dto.getEbookId())
    	        .orElseGet(() -> {
    	            EbookReadingProgress newProgress = new EbookReadingProgress();
    	            newProgress.setMember(memberRepository.findById(mid)
    	                .orElseThrow(() -> new EntityNotFoundException("해당 회원을 찾을 수 없습니다.")));
    	            newProgress.setEbook(ebookRepository.findById(dto.getEbookId())
    	                .orElseThrow(() -> new EntityNotFoundException("해당 전자책을 찾을 수 없습니다.")));
    	            return newProgress;
    	        });
    	progress.setStartCfi(dto.getStartCfi());
        progress.setLastReadTime(LocalDateTime.now());
		if (progress.getEbookRid() == null) {
			ebookReadingProgressRepository.save(progress);
		}

    	
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<EbookSummaryDTO> getEbookAdminList(Pageable pageable, EbookSearchDTO dto) {
    	Specification<Ebook> spec = EbookSpecifications.esFilter(dto);
	    Page<Ebook> ebookList = ebookRepository.findAll(spec, pageable);
		
		return ebookList.map(ebook -> {
			EbookSummaryDTO dto_ = new EbookSummaryDTO();
			modelMapper.map(ebook, dto_);
			return dto_;
		});
    	
    }
    
    @Override
    public void updateEbook(EbookUpdateDTO dto) {
		Ebook ebook = ebookRepository.findById(dto.getEbookId())
				.orElseThrow(() -> new EntityNotFoundException("해당 전자책을 찾을 수 없습니다."));
		if (dto.getEbookTitle() != null) {
			ebook.setEbookTitle(dto.getEbookTitle());
		}
		if (dto.getEbookAuthor() != null) {
			ebook.setEbookAuthor(dto.getEbookAuthor());
		}
		if (dto.getEbookPublisher() != null) {
			ebook.setEbookPublisher(dto.getEbookPublisher());
		}
		if (dto.getEbookDescription() != null) {
			ebook.setEbookDescription(dto.getEbookDescription());
		}
		if (dto.getEbookIsbn() != null) {
			ebook.setEbookIsbn(dto.getEbookIsbn());
		}
		if (dto.getEbookPubDate() != null) {
			ebook.setEbookPubDate(dto.getEbookPubDate());
		}
		if (dto.getIsDelete() != null && dto.getIsDelete().equals("true")) {
			List<String> deleteFile = Collections.singletonList(dto.getExistingImagePath());
			fileUtil.deleteFiles(deleteFile);
			ebook.setEbookCover(null);
		}
		if (dto.getEbookCover() != null) {
			List<MultipartFile> files = Collections.singletonList(dto.getEbookCover());
			try {
				Path epubPath = Paths.get(ebook.getEbookFilePath());
	            Path parentDir = epubPath.getParent();
	            String path = parentDir.toString();
				List<Object> savedFileInfos = fileUtil.saveFiles(files, path);
				LOGGER.info("저장된 파일 정보: {}", savedFileInfos);
				for (Object savedFileInfo : savedFileInfos) {
					Map<String, String> fileInfo = (Map<String, String>) savedFileInfo;
					String originName = fileInfo.get("originalName");
					String pathName = fileInfo.get("filePath");
					if (fileUtil.isImageFile(originName)) {
						ebook.setEbookCover(pathName);
						LOGGER.info("전자책 표지 이미지 경로: {}", pathName);
					}
				}
			} catch (Exception e) {
				LOGGER.error("전자책 표지 이미지 저장 실패: {}", e.getMessage());
				throw new IllegalStateException("전자책 표지 이미지 저장 실패: " + e.getMessage());
			}
		}
    }
    
    @Override
    public void deleteEbook(Long ebookId) {
		Ebook ebook = ebookRepository.findById(ebookId)
				.orElseThrow(() -> new EntityNotFoundException("해당 전자책을 찾을 수 없습니다."));
		String ebookFilePath = ebook.getEbookFilePath();
		if (ebookFilePath != null && !ebookFilePath.isEmpty()) {
	        try {
	            Path path = Paths.get(ebookFilePath);
	            Path parentDir = path.getParent();
	            if (parentDir != null) {
	                fileUtil.deleteFolder(parentDir.toString());
	            }
	        } catch (Exception e) {
				LOGGER.error("전자책 파일 삭제 실패: {}", e.getMessage());
				throw new IllegalStateException("전자책 파일 삭제 실패: " + e.getMessage());
	        }
	    }
		
		ebookRepository.delete(ebook);
    }
    
    @Override
    public ChatbotTitleResponseDTO getBookInfoByBookTitle(String book_title) {
    	String processedTitle = book_title.replaceAll("\\s+", "");
    	List<LibraryBook> searchedBooks = libraryBookRepository.findByBookTitleIgnoringSpacesAndCase(processedTitle);
    	
    	if (searchedBooks.isEmpty()) {
    		return null;
    	}
    	
    	LOGGER.info(searchedBooks.get(0) + "");
		LOGGER.info(searchedBooks + "");
		LOGGER.info(searchedBooks.size() + " 몇개 검색됐니");
    	
		LibraryBook bestMatch = searchedBooks.stream()
			    .min(Comparator.comparingInt(libraryBook ->
			        levenshtein.apply(
			            libraryBook.getBook().getBookTitle().replaceAll("\\s+", "").toLowerCase(),
			            processedTitle.toLowerCase()
			        )))
			    .orElse(null);
    
    	List<LibraryBook> availableBooks = bestMatch.getBook().getLibraryBooks()
    	        .stream()
    	        .filter(libraryBook -> !libraryBook.isDeleted() && 
    	            libraryBook.getRentals().stream()
    	                .noneMatch(rental -> rental.getState() == RentalState.BORROWED))
    	        .distinct()
    	        .collect(Collectors.toList());
    	LOGGER.info(availableBooks + " 대출가능한 도서들");
    	

		
		ChatbotTitleResponseDTO dto = new ChatbotTitleResponseDTO();
		modelMapper.map(bestMatch.getBook(), dto);
		dto.setCount(bestMatch.getBook().getLibraryBooks()
    		    .stream()
    		    .filter(libraryBook -> !libraryBook.isDeleted())
    		    .distinct()  
    		    .count());
		dto.setCanBorrow(!availableBooks.isEmpty());
		Map<String, String> callsignLocation = availableBooks.stream()
		        .collect(Collectors.toMap(
		            LibraryBook::getCallSign,
		            LibraryBook::getLocation
		        ));
		    
		    dto.setCallsignLocation(callsignLocation);
		
		
		
		
    	
    	return dto;
    }
    
   
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    
    private BookSummaryDTO toBookSummaryDTO(LibraryBook libraryBook, String mid) {
        BookSummaryDTO dto = modelMapper.map(libraryBook.getBook(), BookSummaryDTO.class);
       
        modelMapper.map(libraryBook, dto);

        boolean isBorrowed = libraryBook.getRentals().stream()
                .anyMatch(rental -> rental.getState() == RentalState.BORROWED);
        dto.setBorrowed(isBorrowed);

        boolean isUnmanned = libraryBook.getReserves().stream()
                .anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned());
        dto.setUnmanned(isUnmanned);
        boolean isOverdue = libraryBook.getRentals().stream()
				.anyMatch(rental -> rental.getState() == RentalState.BORROWED
						&& LocalDate.now().isAfter(rental.getDueDate()));
        dto.setOverdue(isOverdue);
        int reserveCount = (int) libraryBook.getReserves().stream()
                .filter(reserve -> reserve.getState() == ReserveState.RESERVED)
                .count();
        dto.setReserveCount(reserveCount);

        return dto;
    }
    
    private void reserveBookCommon(Long libraryBookId, String mid, boolean isUnmanned) {
        LibraryBook libraryBook = libraryBookRepository.findByLibraryBookIdAndIsDeletedFalse(libraryBookId).orElse(null);
        Member member = memberRepository.findById(mid).orElse(null);
        if (libraryBook == null) {
            throw new IllegalArgumentException("도서 정보를 찾을 수 없습니다.");
        }
        if (member == null) {
            throw new IllegalArgumentException("회원 정보를 찾을 수 없습니다.");
        }
        List<Rental> rentals = rentalRepository.findByMemberMid(mid);
        BookStatusCountDto countDto = libraryBookRepository.countReserveAndBorrowDto(member.getMno(), ReserveState.RESERVED, RentalState.BORROWED);
        boolean isDeleted = libraryBook.isDeleted();
        
        boolean isBorrowed = libraryBook.getRentals().stream()
                .anyMatch(rental -> rental.getState() == RentalState.BORROWED);
        boolean isAlreadyUnmannedByMember = libraryBook.getReserves().stream()
                .anyMatch(reserve -> reserve.getMember().getMid().equals(mid)
                        && reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true);
        boolean isAlreadyReservedByMember = libraryBook.getReserves().stream()
                .anyMatch(reserve -> reserve.getMember().getMid().equals(mid)
                        && reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false);
        boolean isReserved = libraryBook.getReserves().stream()
                .anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false);
        boolean isUnmannedExists = libraryBook.getReserves().stream()
                .anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true);

        boolean alreadyBorrowedByMember = libraryBook.getRentals().stream()
                .anyMatch(rental -> rental.getMember().getMid().equals(mid)
                        && rental.getState() == RentalState.BORROWED);
        boolean isMemberOverdue = rentals.stream()
                .anyMatch(rental -> rental.getMember().getMid().equals(mid)
                        && rental.getState() == RentalState.BORROWED && LocalDate.now().isAfter(rental.getDueDate()));
		boolean isMemberPenalty = member.getState() == MemberState.OVERDUE && member.getPenaltyDate() != null && member.getPenaltyDate().isAfter(LocalDate.now());
		boolean isMemberPunish = member.getState() == MemberState.PUNISH;
		
		if (isDeleted) {
			throw new IllegalStateException("삭제된 도서입니다.");
		}
		if (isMemberPunish) {
			throw new IllegalStateException("제재 상태로 인해 예약할 수 없습니다.");
		}
		if (isMemberPenalty) {
			throw new IllegalStateException("연체 패널티로 인해 예약할 수 없습니다.");
		}

		if (isAlreadyUnmannedByMember) {
		    throw new IllegalStateException("이미 무인예약한 도서입니다.");
		}
		if (alreadyBorrowedByMember) {
		    throw new IllegalStateException("이미 대출한 도서입니다.");
		}
		if (isMemberOverdue) {
		    throw new IllegalStateException("연체된 도서가 있어 예약할 수 없습니다.");
		}
		if (countDto.getReserveCount() + countDto.getBorrowCount() + countDto.getUnmannedCount() >= 5) {
		    throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 대출중인 도서 : " + countDto.getBorrowCount() + ", 예약중인 도서 : " + countDto.getReserveCount() + ", 무인예약중인 도서 : " + countDto.getUnmannedCount());
		}

		if (isUnmanned) {
		    if (isBorrowed || isUnmannedExists) {
		        throw new IllegalStateException("대출중인 도서입니다.");
		    }
		    if (isReserved) {
		        throw new IllegalStateException("대출 예약중인 도서입니다.");
		    }
		} else {
	
		    if (!isBorrowed && !isUnmannedExists) {
		        throw new IllegalStateException("대출 가능한 도서를 예약할 수 없습니다.");
		    }
		    if (isAlreadyReservedByMember) {
		        throw new IllegalStateException("이미 예약된 도서입니다.");
		    }
		    if (reserveRepository.countByReserveState(libraryBookId, ReserveState.RESERVED) >= 2) {
		        throw new IllegalStateException("해당 도서의 예약가능 횟수가 초과되었습니다.");
		    }
		    if (countDto.getReserveCount() >= 3) {
		        throw new IllegalStateException("예약 한도를 초과했습니다. 예약중인 도서 권수 : " + countDto.getReserveCount());
		    }
		}

        Reserve reserve = new Reserve();
        reserve.setLibraryBook(libraryBook);
        reserve.setMember(member);
        reserve.setReserveDate(LocalDateTime.now());
        reserve.setState(ReserveState.RESERVED);
        reserve.setUnmanned(isUnmanned);
        reserveRepository.save(reserve);
    }
    
    private List<BookTopSumDTO> calculateTopBooksForPeriod(String period) {
        LocalDate startDate;
        LocalDate endDate = LocalDate.now();
        
       
        switch (period) {
            case "오늘":
                startDate = LocalDate.now();
                break;
            case "일주일":
                startDate = LocalDate.now().minusWeeks(1);
                break;
            case "한달":
                startDate = LocalDate.now().minusMonths(1);
                break;
            default:
                startDate = LocalDate.now();
        }
        
       
        List<Object[]> allBooks = libraryBookRepository.findTop100BorrowedBooks(startDate, endDate);
        
        
        List<BookTopSumDTO> dtoList = allBooks.stream()
            .map(row -> {
                BookTopSumDTO dto = new BookTopSumDTO();
                dto.setBookTitle((String) row[0]);
                dto.setAuthor((String) row[1]);
                dto.setPublisher((String) row[2]);
                java.sql.Date sqlDate = (java.sql.Date) row[3];
                dto.setPubDate(sqlDate != null ? sqlDate.toLocalDate() : null);
                dto.setCover((String) row[4]);
                dto.setLibraryBookId((Long) row[5]);
                dto.setBorrowCount(((Number) row[6]).longValue());
                dto.setIsbn((String) row[7]);
                return dto;
            })
            .collect(Collectors.toList());
            
        return dtoList;
    }
    
    

	
}