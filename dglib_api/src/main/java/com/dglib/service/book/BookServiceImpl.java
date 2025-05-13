package com.dglib.service.book;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dglib.dto.book.BookDTO;
import com.dglib.dto.book.BookDetailDTO;
import com.dglib.dto.book.BookRegistrationDTO;
import com.dglib.dto.book.BookStatusCountDto;
import com.dglib.dto.book.BookSummaryDTO;
import com.dglib.dto.book.LibraryBookDTO;
import com.dglib.dto.book.LibraryBookSearchByBookIdDTO;
import com.dglib.dto.book.RentalBookListDTO;
import com.dglib.dto.book.RentalStateChangeDTO;
import com.dglib.dto.book.ReservationCountDTO;
import com.dglib.dto.book.ReserveBookListDTO;
import com.dglib.dto.book.ReserveStateChangeDTO;
import com.dglib.entity.book.Book;
import com.dglib.entity.book.LibraryBook;
import com.dglib.entity.book.Rental;
import com.dglib.entity.book.RentalState;
import com.dglib.entity.book.Reserve;
import com.dglib.entity.book.ReserveState;
import com.dglib.entity.member.Member;
import com.dglib.repository.book.BookRepository;
import com.dglib.repository.book.LibraryBookRepository;
import com.dglib.repository.book.LibraryBookSpecifications;
import com.dglib.repository.book.RentalRepository;
import com.dglib.repository.book.ReserveRepository;
import com.dglib.repository.member.MemberRepository;
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
	private final Logger LOGGER = LoggerFactory.getLogger(BookServiceImpl.class);
	
	
	
	@Override
	public void registerBook(BookRegistrationDTO bookRegistrationDto) {
		BookDTO bookDto = bookRegistrationDto.getBook();
		List<LibraryBookDTO> libraryBooks = bookRegistrationDto.getLibraryBooks();
		Book bookEntity = bookRepository.findById(bookDto.getIsbn())
	            .orElseGet(() -> {
	                Book newBook = modelMapper.map(bookDto, Book.class);
	                return bookRepository.save(newBook);
	            });
		List<String> callsigns = libraryBooks.stream()
		        .map(LibraryBookDTO::getCallSign)
		        .collect(Collectors.toList());
		
		List<String> existingCallsigns = libraryBookRepository.findExistingCallSigns(callsigns);
		
		if (!existingCallsigns.isEmpty()) {
			throw new IllegalStateException("이미 존재하는 청구번호입니다.: " + existingCallsigns);
		}

		
		List<LibraryBook> libraryBookEntities = libraryBooks.stream()
		        .map(dto -> {
		            LibraryBook entity = modelMapper.map(dto, LibraryBook.class);
		            entity.setBook(bookEntity);
		            return entity;
		        })
		        .collect(Collectors.toList());

		libraryBookRepository.saveAll(libraryBookEntities);
	}
	
	@Override
	@Transactional(readOnly = true)
	public Page<BookSummaryDTO> getBookList(Pageable pageable, String query, String option, List<String> previousQueries, List<String> previousOptions) {
		Specification<LibraryBook> spec = null;
		spec = LibraryBookSpecifications.research(query, option, previousQueries, previousOptions);    
        Page<LibraryBook> libraryBooks = libraryBookRepository.findAll(spec, pageable);
        
        return libraryBooks.map(libraryBook -> {
            BookSummaryDTO dto = modelMapper.map(libraryBook.getBook(), BookSummaryDTO.class);
            modelMapper.map(libraryBook, dto);
            return dto;
        });
	}

	
	@Override
	@Transactional(readOnly = true)
	public BookDetailDTO getLibraryBookDetail(Long libraryBookId) {
		String id = "kdh3218";
		LibraryBook libraryBook = libraryBookRepository.findByLibraryBookId(libraryBookId).orElse(null);
		BookDetailDTO dto = new BookDetailDTO();
		boolean isRented = rentalRepository.existsByLibraryBookLibraryBookIdAndStateNot(
	            libraryBookId, RentalState.RETURNED);
		int reserveCount = reserveRepository.countByLibraryBookLibraryBookIdAndState(
	            libraryBookId, ReserveState.RESERVED);
		boolean alreadyReservedByMember = reserveRepository.existsByLibraryBookLibraryBookIdAndMemberMidAndState(
	            libraryBookId, id, ReserveState.RESERVED);
		 dto.setRented(isRented);
		 dto.setReserveCount(reserveCount);
		 dto.setAlreadyReservedByMember(alreadyReservedByMember);
		 modelMapper.map(libraryBook.getBook(), dto);
		 modelMapper.map(libraryBook, dto);
		 
		 return dto;
		
		
	}
	
	@Override
	@Transactional(readOnly = true)
	public Page<RentalBookListDTO> getRentalList(Pageable pageable) {
		Page<Rental> rentalList = rentalRepository.findAll(pageable);
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
	public void reserveBook(Long libraryBookId, String id) {
		LibraryBook libraryBook = libraryBookRepository.findById(libraryBookId).orElse(null);
		Member member = memberRepository.findById(id).orElse(null);
		BookStatusCountDto countDto = libraryBookRepository.countReserveAndBorrowDto(member.getMno(), ReserveState.RESERVED, RentalState.BORROWED);
		LOGGER.info("대출예약현황" + countDto);
		if (reserveRepository.countByReserveState(libraryBookId, ReserveState.RESERVED) >= 2) {
			throw new IllegalStateException("해당 도서의 예약가능 횟수가 초과되었습니다.");
		}
		if (countDto.getReserveCount() >= 3) {
			throw new IllegalStateException("예약 한도를 초과했습니다. 예약중인 도서 : " + countDto.getReserveCount());
		}
		if (countDto.getReserveCount() + countDto.getBorrowCount() >= 5) {
			throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 대출중인 도서 : " + countDto.getBorrowCount() + ", 예약중인 도서 : " + countDto.getReserveCount());
		}
		Reserve reserve = new Reserve();
	    reserve.setLibraryBook(libraryBook);
	    reserve.setMember(member);
	    reserve.setReserveDate(LocalDateTime.now());
	    reserve.setState(ReserveState.RESERVED);
	    reserve.setUnmanned(false);
	    reserveRepository.save(reserve);	
	}
	
	@Override
	@Transactional(readOnly = true)
	public Page<ReserveBookListDTO> getReserveList(Pageable pageable) {
	    Page<Reserve> reserveList = reserveRepository.findAll(pageable);
	    Map<Long, List<Reserve>> bookReservationsMap = new HashMap<>();
	    return reserveList.map(reserve -> {
	        ReserveBookListDTO dto = new ReserveBookListDTO();
	        LibraryBook libraryBook = reserve.getLibraryBook();
	        modelMapper.map(libraryBook, dto);
	        modelMapper.map(libraryBook.getBook(), dto);
	        modelMapper.map(reserve.getMember(), dto);
	        modelMapper.map(reserve, dto);
	        Integer rank = null;
	        if (reserve.getState() == ReserveState.RESERVED) {
	            List<Reserve> reservedOnlyList = bookReservationsMap.computeIfAbsent(
	                libraryBook.getLibraryBookId(), 
	                k -> libraryBook.getReserves().stream()
	                    .filter(r -> r.getState() == ReserveState.RESERVED)
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
	    List<Reserve> reserves = reserveRepository.findAllByIdInWithDetails(reserveIds);    
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
	    }
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Long reserveId = dto.getReserveId();
	        Reserve reserve = reserveMap.get(reserveId);
	        reserve.changeState(ReserveState.CANCELED);
	    }
	}
	
	@Override
	public void reReserveBook(List<ReserveStateChangeDTO> reserveStateChangeDtos) {
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
	        if (reserve.getState() == ReserveState.BORROWED) {
	            throw new IllegalStateException("이미 대출 완료된 예약입니다.");
	        }
	        if (reserve.getState() == ReserveState.RESERVED) {
	            throw new IllegalStateException("이미 예약중인 도서입니다.");
	        }
	    }
	    
	    Set<String> memberIds = reserveStateChangeDtos.stream()
	        .map(ReserveStateChangeDTO::getMid)
	        .collect(Collectors.toSet());
	    
	    Map<String, Long> currentDbReservedCounts = new HashMap<>();
        Map<String, Long> currentDbBorrowedCounts = new HashMap<>();
        
        List<Reserve> currentMemberReservations = reserveRepository.findByMemberMidInAndState(
                new ArrayList<>(memberIds), ReserveState.RESERVED
            );
        currentDbReservedCounts = currentMemberReservations.stream()
                .collect(Collectors.groupingBy(r -> r.getMember().getMid(), Collectors.counting()));
        
        List<Rental> currentMemberRentals = rentalRepository.findByMemberMidInAndState(
                new ArrayList<>(memberIds), RentalState.BORROWED
            );
        
        currentDbBorrowedCounts = currentMemberRentals.stream()
                .collect(Collectors.groupingBy(rt -> rt.getMember().getMid(), Collectors.counting()));
        
        Map<String, Long> newReservationsPerMember = reserveStateChangeDtos.stream()
                .collect(Collectors.groupingBy(ReserveStateChangeDTO::getMid, Collectors.counting()));
        
        for (String memberId : memberIds) {
            long reservedCount = currentDbReservedCounts.getOrDefault(memberId, 0L);
            long borrowedCount = currentDbBorrowedCounts.getOrDefault(memberId, 0L);
            long toBeAddedCount = newReservationsPerMember.get(memberId); 

            if (reservedCount + borrowedCount + toBeAddedCount > 5) {
                throw new IllegalStateException("대출 및 예약 가능 횟수를 초과했습니다. 회원 ID: " + memberId + ", 현재 대출: " + borrowedCount +
						", 현재 예약: " + reservedCount + ", 추가 예약: " + toBeAddedCount + ", 초과 권수: "
						+ ((reservedCount + borrowedCount + toBeAddedCount) - 5));
            }
            if (reservedCount + toBeAddedCount > 3) {
                throw new IllegalStateException("예약 한도를 초과했습니다. 회원 ID: " + memberId + ", 현재 예약: " + reservedCount + ", 추가 예약: " + toBeAddedCount + ", 초과 권수: "
                		                        + ((reservedCount + toBeAddedCount) - 3));
            }
        }

	    
	    Map<Long, List<ReserveStateChangeDTO>> bookReservations = reserveStateChangeDtos.stream()
	        .collect(Collectors.groupingBy(ReserveStateChangeDTO::getLibraryBookId));
	    Set<Long> libraryBookIds = bookReservations.keySet();
	    List<Reserve> existingReservations = reserveRepository.findByMemberMidInAndStateAndLibraryBookLibraryBookIdIn(
	        memberIds, ReserveState.RESERVED, libraryBookIds);
	    Map<String, Set<Long>> memberReservedBooks = new HashMap<>();
	    
	    for (Reserve reserve : existingReservations) {
	        String memberId = reserve.getMember().getMid();
	        Long libraryBookId = reserve.getLibraryBook().getLibraryBookId();

	        memberReservedBooks.computeIfAbsent(memberId, k -> new HashSet<>())
	            .add(libraryBookId);
	    }
	    
	    
	    Map<String, Set<Long>> requestedMemberBooks = new HashMap<>();
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        String memberId = dto.getMid();
	        Long libraryBookId = dto.getLibraryBookId();
	        
	        if (requestedMemberBooks.containsKey(memberId) && 
	            requestedMemberBooks.get(memberId).contains(libraryBookId)) {
	            throw new IllegalStateException("동일한 요청 내에서 같은 도서를 중복 예약할 수 없습니다.");
	        }
	        
	        if (memberReservedBooks.containsKey(memberId) &&
	            memberReservedBooks.get(memberId).contains(libraryBookId)) {
	            throw new IllegalStateException("회원이 이미 예약 중인 도서입니다.");
	        }
	        
	        requestedMemberBooks.computeIfAbsent(memberId, k -> new HashSet<>())
	            .add(libraryBookId);
	    }
	    List<ReservationCountDTO> reservationCounts =
	        reserveRepository.findReservationCounts(libraryBookIds, ReserveState.RESERVED);
	    Map<Long, Long> currentReservationCounts = new HashMap<>();
	    for (ReservationCountDTO dto : reservationCounts) {
	        currentReservationCounts.put(dto.getLibraryBookId(), dto.getCount());
	    }
	    for (Map.Entry<Long, List<ReserveStateChangeDTO>> entry : bookReservations.entrySet()) {
	        Long libraryBookId = entry.getKey();
	        int reservationsForThisBook = entry.getValue().size();

	        Long currentReservations = currentReservationCounts.getOrDefault(libraryBookId, 0L);
	        if (currentReservations + reservationsForThisBook > 2) {
	            throw new IllegalStateException("도서의 예약가능 횟수가 초과되었습니다. 선택된 도서 수: " + reservationsForThisBook + ", 현재 예약 수: " + currentReservations);
	        }
	    }
	    for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
	        Long reserveId = dto.getReserveId();
	        Reserve reserve = reserveMap.get(reserveId);
	        reserve.changeState(ReserveState.RESERVED);
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
        
        List<Long> libraryBookIds = new ArrayList<>();
        for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
            Long reserveId = dto.getReserveId();
            Reserve reserve = reserveMap.get(reserveId);
            Integer rank = dto.getReservationRank();
            if (rank != null && rank > 1) {
                throw new IllegalStateException("예약 우선 순위가 충족되지 않아 대출을 완료할 수 없습니다.");
            }
            libraryBookIds.add(reserve.getLibraryBook().getLibraryBookId());
        }
        List<Long> distinctLibraryBookIds = libraryBookIds.stream().collect(Collectors.toList());
        List<Long> BorrowedLibraryBookIds = rentalRepository.findBorrowedLibraryBookIdsIn(distinctLibraryBookIds);
            
      
        List<Rental> rentalsToCreate = new ArrayList<>();
        for (ReserveStateChangeDTO dto : reserveStateChangeDtos) {
            Reserve reserve = reserveMap.get(dto.getReserveId());            
            if (BorrowedLibraryBookIds.contains(reserve.getLibraryBook().getLibraryBookId())) {
                throw new IllegalStateException("이미 대출 중인 도서입니다.");
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
//		for (ReserveStateChangeDto dto : reserveStateChangeDtos) {
//			Long reserveId = dto.getReserveId();
//			ReserveState newState = dto.getState();
//			Integer rank = dto.getReservationRank();
//			if (rank != null && rank > 1) {
//				throw new IllegalStateException("예약 우선 순위가 충족되지 않아 대출을 완료할 수 없습니다.");
//			}
//			if (newState == ReserveState.CANCELED) {
//                throw new IllegalStateException("취소된 예약은 대출 완료로 변경할 수 없습니다.");
//            }
//			Reserve reserve = reserveRepository.findById(reserveId)
//		            .orElseThrow(() -> new EntityNotFoundException("해당 예약 ID를 찾을 수 없습니다: " + reserveId));
//			List<RentalState> states = rentalRepository.findStatesByLibraryBookId(reserve.getLibraryBook().getLibraryBookId());
//			if (states.contains(RentalState.BORROWED)) {
//			    throw new IllegalStateException("이미 대출 중인 도서입니다.");
//			}
//			reserve.changeState(ReserveState.BORROWED);
//			Rental rental = new Rental();
//			rental.setLibraryBook(reserve.getLibraryBook());
//			rental.setMember(reserve.getMember());
//			rental.setRentStartDate(LocalDate.now());
//			rental.setDueDate(LocalDate.now().plusDays(7));
//			rental.setState(RentalState.BORROWED);
//			rentalRepository.save(rental);
//		}
	
	
	@Override
	public void completeBookReturn(List<RentalStateChangeDTO> rentalStateChangeDtos) {
		List<Long> rentIds = rentalStateChangeDtos.stream()
                .map(RentalStateChangeDTO::getRentId)
                .collect(Collectors.toList());
		List<Rental> rentals = rentalRepository.findAllByIdInWithDetails(rentIds);
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
}

