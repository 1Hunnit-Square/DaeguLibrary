package com.dglib.service.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dglib.dto.book.AddInterestedBookDTO;
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
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.BorrowedBookSearchDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.entity.book.Book;
import com.dglib.entity.book.InterestedBook;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.member.Member;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.InterestedBookRepository;
import com.dglib.repository.book.InterestedBookSpecifications;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.repository.book.LibraryBookSpecifications;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.book.RentalSpecifications;
import com.dglib.repository.book.ReserveRepository;
import com.dglib.repository.book.ReserveSpecifications;
import com.dglib.repository.member.MemberRepository;

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
	private final InterestedBookRepository interestedBookRepository;
	private final Logger LOGGER = LoggerFactory.getLogger(BookServiceImpl.class);
	
	
	
	
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
	                modelMapper.map(dto, entity);
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
	}
	
	@Override
	@Transactional(readOnly = true)
	public Page<BookSummaryDTO> getNsBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions, String mid) {
		Specification<LibraryBook> spec = null;
		spec = LibraryBookSpecifications.research(query, option, previousQueries, previousOptions);    
        Page<LibraryBook> libraryBooks = libraryBookRepository.findAll(spec, pageable);
        
        return libraryBooks.map(libraryBook -> toBookSummaryDTO(libraryBook, mid));
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
	@Transactional(readOnly = true)
	public Page<BookTopSumDTO> getTopBorrowedBookList(Pageable pageable, String check) {
		LocalDate startDate;
		LocalDate endDate = LocalDate.now();
		switch (check) {
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
		
		List<LibraryBook> allBooks = libraryBookRepository.findTop100MostRentedBooksByDateRange(startDate, endDate);
	    List<LibraryBook> top100Books = allBooks.stream()
	    		.sorted((b1, b2) -> Integer.compare(b2.getRentals().size(), b1.getRentals().size()))
	    	    .limit(100)
	    	    .collect(Collectors.toList());
	    
	    int start = (int) pageable.getOffset();
	    int end = Math.min(start + pageable.getPageSize(), top100Books.size());
	    
	    List<LibraryBook> pagedBooks = top100Books.subList(start, end);
	    
	    LOGGER.info(pagedBooks.toString());

	    
	    List<BookTopSumDTO> dtoList = pagedBooks.stream()
	            .map(libraryBook -> {
	                BookTopSumDTO dto = modelMapper.map(libraryBook.getBook(), BookTopSumDTO.class);
	                dto.setLibraryBookId(libraryBook.getLibraryBookId());
	                long borrowCount = libraryBook.getRentals().size();
	                dto.setBorrowCount(borrowCount);
	                return dto;
	            })
	            .collect(Collectors.toList());
		
	    return new PageImpl<>(dtoList, pageable, top100Books.size());
	}

	
	@Override
	@Transactional(readOnly = true)
	public BookDetailDTO getLibraryBookDetail(Long libraryBookId, String mid) {
	    LibraryBook libraryBook = libraryBookRepository.findWithDetailsByLibraryBookId(libraryBookId)
	            .orElseThrow(() -> new EntityNotFoundException("도서를 찾을 수 없습니다."));
	    BookDetailDTO dto = new BookDetailDTO();
	    List<LibraryBookResponseDTO> libraryBooks = libraryBook.getBook().getLibraryBooks().stream()
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
	    					.filter(reserve -> reserve.getState() == ReserveState.RESERVED).count();
	    			lbDto.setReserveCount(reserveCount);
	    			boolean alreadyReservedByMember = mid != null && lb.getReserves().stream()
	    					.anyMatch(reserve -> reserve.getMember().getMid().equals(mid)
	    							&& reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false);
	    			lbDto.setAlreadyReservedByMember(alreadyReservedByMember);
	    			boolean alreadyBorrowedByMember = mid != null && lb.getRentals().stream().anyMatch(
	    					rental -> rental.getMember().getMid().equals(mid) && rental.getState() == RentalState.BORROWED);
	    			lbDto.setAlreadyBorrowedByMember(alreadyBorrowedByMember);
	    			boolean alreadyUnmannedByMember = mid != null
	    					&& lb.getReserves().stream().anyMatch(reserve -> reserve.getMember().getMid().equals(mid)
	    							&& reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true);
	    			lbDto.setAlreadyUnmannedByMember(alreadyUnmannedByMember);
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
	public Page<RentalBookListDTO> getRentalList(Pageable pageable, BorrowedBookSearchDTO borrowedBookSearchDto) {
		Specification<Rental> spec = RentalSpecifications.rsFilter(borrowedBookSearchDto);
		Page<Rental> rentalList = rentalRepository.findAll(spec, pageable);
		return rentalList.map(rental -> {
			RentalBookListDTO dto = new RentalBookListDTO();
			modelMapper.map(rental.getLibraryBook(), dto);
			modelMapper.map(rental.getLibraryBook().getBook(), dto);
			modelMapper.map(rental.getMember(), dto);
			modelMapper.map(rental, dto);
			return dto;
		});
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
	public void deleteLibraryBook(Long libraryBookId, String isbn) {
		libraryBookRepository.deleteById(libraryBookId);
		boolean exists = libraryBookRepository.existsByBookIsbn(isbn);
		if (!exists) {
			bookRepository.deleteById(isbn);
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
    public void addInterestedBook(String mid, AddInterestedBookDTO addInterestedBookDto) {
    	List<Long> libraryBookIds = addInterestedBookDto.getLibraryBookIds();
    	List<LibraryBook> libraryBooks = libraryBookRepository.findByLibraryBookIdIn(libraryBookIds);
    	Member member = memberRepository.findById(mid)
    		    .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));
    	List<InterestedBook> existingInterestedBooks = interestedBookRepository.findByLibraryBookInAndMemberMid(libraryBooks, mid);
    	if (!existingInterestedBooks.isEmpty()) {
    	    String duplicatedTitles = existingInterestedBooks.stream()
    	        .map(ib -> ib.getLibraryBook().getBook().getBookTitle())  
    	        .collect(Collectors.joining(", "));
    	    throw new IllegalStateException("이미 관심 도서로 등록된 책이 포함되어 있습니다: " + duplicatedTitles);
    	}
    	List<InterestedBook> interestedBooks = libraryBooks.stream()
    			.map(libraryBook -> {
    				InterestedBook ib = new InterestedBook();
    				ib.setLibraryBook(libraryBook);
    				ib.setMember(member);
    				return ib;
    			}).collect(Collectors.toList());
    	
    	interestedBookRepository.saveAll(interestedBooks);
    }
    
    @Override
	public Page<InterestedBookResponseDTO> getInterestedBookList(Pageable pageable, InterestedBookRequestDTO interestedBookRequestDto, String mid) {
		Specification<InterestedBook> spec = InterestedBookSpecifications.ibFilter(interestedBookRequestDto, mid);
		Page<InterestedBook> interestedBooks = interestedBookRepository.findAll(spec, pageable);

		return interestedBooks.map(interestedBook -> {
			InterestedBookResponseDTO dto = new InterestedBookResponseDTO();
			boolean isReserved = interestedBook.getLibraryBook().getReserves().stream()
					.anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false);
			boolean isUnmanned = interestedBook.getLibraryBook().getReserves().stream()
					.anyMatch(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == true);
			boolean isBorrowed = interestedBook.getLibraryBook().getRentals().stream()
					.anyMatch(rental -> rental.getState() == RentalState.BORROWED);
			Long reserveCount = interestedBook.getLibraryBook().getReserves().stream()
					.filter(reserve -> reserve.getState() == ReserveState.RESERVED && reserve.isUnmanned() == false)
					.count();
			modelMapper.map(interestedBook.getLibraryBook(), dto);
			modelMapper.map(interestedBook.getLibraryBook().getBook(), dto);
			modelMapper.map(interestedBook, dto);
			dto.setReserved(isReserved);
			dto.setUnmanned(isUnmanned);
			dto.setBorrowed(isBorrowed);
			dto.setReserveCount(reserveCount);
			return dto;
		});
    	
    }
    
    @Override
	public void deleteInterestedBook(InteresdtedBookDeleteDTO interesdtedBookDeleteDto, String mid) {
    	
		List<Long> interestedBookIds = interesdtedBookDeleteDto.getIbIds();
		List<InterestedBook> interestedBooks = interestedBookRepository.findByIbIdIn(interestedBookIds);
		Map<Long, InterestedBook> interestedBookMap = interestedBooks.stream()
				.collect(Collectors.toMap(InterestedBook::getIbId, interestedBook -> interestedBook));
		for (Long ibId : interestedBookIds) {
			InterestedBook interestedBook = interestedBookMap.get(ibId);
			if (interestedBook == null) {
				throw new IllegalStateException("해당 관심 도서 정보를 찾을 수 없습니다.");
			}
			if (!interestedBook.getMember().getMid().equals(mid)) {
				throw new IllegalStateException("해당 관심 도서를 삭제할 권한이 없습니다.");
			}
		}
		interestedBookRepository.deleteAll(interestedBooks);
		
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

        boolean alreadyReservedByMember = false;
        if (mid != null) {
            alreadyReservedByMember = libraryBook.getReserves().stream()
                    .anyMatch(reserve -> reserve.getMember().getMid().equals(mid)
                            && reserve.getState() == ReserveState.RESERVED);
        }
        dto.setAlreadyReservedByMember(alreadyReservedByMember);

        boolean alreadyBorrowedByMember = false;
        if (mid != null) {
            alreadyBorrowedByMember = libraryBook.getRentals().stream()
                    .anyMatch(rental -> rental.getMember().getMid().equals(mid)
                            && rental.getState() == RentalState.BORROWED);
        }
        dto.setAlreadyBorrowedByMember(alreadyBorrowedByMember);

        int reserveCount = (int) libraryBook.getReserves().stream()
                .filter(reserve -> reserve.getState() == ReserveState.RESERVED)
                .count();
        dto.setReserveCount(reserveCount);

        return dto;
    }
    
    public void reserveBookCommon(Long libraryBookId, String mid, boolean isUnmanned) {
        LibraryBook libraryBook = libraryBookRepository.findWithDetailsByLibraryBookId(libraryBookId).orElse(null);
        Member member = memberRepository.findById(mid).orElse(null);
        if (libraryBook == null || member == null) {
            throw new IllegalArgumentException("도서 혹은 회원 정보를 찾을 수 없습니다.");
        }
        List<Rental> rentals = rentalRepository.findByMemberMid(mid);
        BookStatusCountDto countDto = libraryBookRepository.countReserveAndBorrowDto(member.getMno(), ReserveState.RESERVED, RentalState.BORROWED);

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


        if (isUnmanned) {
    
            if (isAlreadyUnmannedByMember) {
                throw new IllegalStateException("이미 무인예약한 도서입니다.");
            }
            if (alreadyBorrowedByMember) {
                throw new IllegalStateException("이미 대출한 도서입니다.");
            }
            if (isBorrowed || isUnmannedExists) {
                throw new IllegalStateException("대출중인 도서입니다.");
            }
            if (isMemberOverdue) {
                throw new IllegalStateException("연체된 도서가 있어 예약할 수 없습니다.");
            }
            if (countDto.getReserveCount() + countDto.getBorrowCount() + countDto.getUnmannedCount() >= 5) {
                throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 대출중인 도서 : " + countDto.getBorrowCount() + ", 예약중인 도서 : " + countDto.getReserveCount() + ", 무인예약중인 도서 : " + countDto.getUnmannedCount());
            }
            if (isReserved) {
                throw new IllegalStateException("대출 예약중인 도서입니다.");
            }
        } else {
       
            if (!isBorrowed && !isUnmannedExists) {
                throw new IllegalStateException("대출 가능한 도서를 예약할 수 없습니다.");
            }
            if (isAlreadyUnmannedByMember) {
                throw new IllegalStateException("이미 무인예약한 도서입니다.");
            }
            if (isMemberOverdue) {
                throw new IllegalStateException("연체된 도서가 있어 예약할 수 없습니다.");
            }
            if (alreadyBorrowedByMember) {
                throw new IllegalStateException("이미 대출한 도서입니다.");
            }
            if (isAlreadyReservedByMember) {
                throw new IllegalStateException("이미 예약된 도서입니다.");
            }
            if (reserveRepository.countByReserveState(libraryBookId, ReserveState.RESERVED) >= 2) {
                throw new IllegalStateException("해당 도서의 예약가능 횟수가 초과되었습니다.");
            }
            if (countDto.getReserveCount() >= 3) {
                throw new IllegalStateException("예약 한도를 초과했습니다. 예약중인 도서 : " + countDto.getReserveCount());
            }
            if (countDto.getReserveCount() + countDto.getBorrowCount() + countDto.getUnmannedCount() >= 5) {
                throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 대출중인 도서 : " + countDto.getBorrowCount() + ", 예약중인 도서 : " + countDto.getReserveCount() + ", 무인예약중인 도서 : " + countDto.getUnmannedCount());
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

	
}