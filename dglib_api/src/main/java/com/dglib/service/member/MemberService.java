package com.dglib.service.member;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;

import com.dglib.dto.book.AddInterestedBookDTO;
import com.dglib.dto.book.EbookMemberDeleteDTO;
import com.dglib.dto.book.EbookMemberRequestDTO;
import com.dglib.dto.book.EbookMemberResponseDTO;
import com.dglib.dto.book.InteresdtedBookDeleteDTO;
import com.dglib.dto.book.InterestedBookRequestDTO;
import com.dglib.dto.book.InterestedBookResponseDTO;
import com.dglib.dto.member.AgeCountDTO;
import com.dglib.dto.member.BorrowHistoryRequestDTO;
import com.dglib.dto.member.ChatMemberBorrowResponseDTO;
import com.dglib.dto.member.ChatMemberReservationResponseDTO;
import com.dglib.dto.member.ContactListDTO;
import com.dglib.dto.member.ContactSearchDTO;
import com.dglib.dto.member.EmailInfoListDTO;
import com.dglib.dto.member.EmailInfoSearchDTO;
import com.dglib.dto.member.GenderCountDTO;
import com.dglib.dto.member.MemberBasicDTO;
import com.dglib.dto.member.MemberBorrowHistoryDTO;
import com.dglib.dto.member.MemberBorrowNowListDTO;
import com.dglib.dto.member.MemberEbookDetailDTO;
import com.dglib.dto.member.MemberFindAccountDTO;
import com.dglib.dto.member.MemberFindIdDTO;
import com.dglib.dto.member.MemberInfoDTO;
import com.dglib.dto.member.MemberListDTO;
import com.dglib.dto.member.MemberManageDTO;
import com.dglib.dto.member.MemberPhoneDTO;
import com.dglib.dto.member.MemberRecoBookDTO;
import com.dglib.dto.member.MemberReserveListDTO;
import com.dglib.dto.member.MemberSearchByMnoDTO;
import com.dglib.dto.member.MemberSearchDTO;
import com.dglib.dto.member.MemberWishBookListDTO;
import com.dglib.dto.member.ModMemberDTO;
import com.dglib.dto.member.RegMemberDTO;
import com.dglib.dto.member.RegionCountDTO;

public interface MemberService {
	
	Page<MemberSearchByMnoDTO> searchByMno(String mno, Pageable pageable);
	
	boolean existById(String mid);
	
	void registerMember(RegMemberDTO regMemberDTO);
	
	boolean existByPhone(String phone);
	

	Page<MemberListDTO> findAll(MemberSearchDTO searchDTO, Pageable pageable);
	
	void manageMember(MemberManageDTO memberManageDTO);
	
	String findId(MemberFindIdDTO memberFindIdDTO);
	
	boolean existAccount(MemberFindAccountDTO memberFindAccountDTO);
	
	void modPwMember(String mid, String pw);
	
	MemberInfoDTO findMemberInfo(String mid, String pw);
	
	void modifyMember(String mid, ModMemberDTO modMemberDTO);

	void executeOverdueCheck();
	
	boolean isLastSuccessOverdueCheckDateToday();
	
	List<MemberBorrowNowListDTO> getMemberBorrowNowList(String mid);
	
	void extendMemberBorrow(List<Long> rentIds);
	
	MemberBasicDTO getMemberBasicInfo(String mid);

	Page<MemberBorrowHistoryDTO> getMemberBorrowHistory(String mid, Pageable pageable, BorrowHistoryRequestDTO borrowHistoryRequestDTO);
	
	List<MemberReserveListDTO> getMemberReserveList(String mid);
	
	void cancelReserve(Long reserveId);
	
	List<String> getMemberBorrowedBookIsbns(String mid);
	
	Map<String, Map<String, Integer>> getMemberYearBorrowList(String mid);
	
	MemberRecoBookDTO getMemberBorrowedBookIsbnForReco(String mid);
	
	MemberPhoneDTO getMemberPhone(String mid);
	
	List<MemberWishBookListDTO> getMemberWishBookList(String mid, int year);
	
	void cancelWishBook(Long wishId, String mid);
	
	MemberEbookDetailDTO getMemberEbookDetail(Long ebookId, String mid);
	

	String getKakaoEmail(HttpHeaders headers);
	
	void regKakao(String kakaoEmail);
	
	List<ContactListDTO> getContactList (ContactSearchDTO searchDTO, Sort sort);
	
	List<EmailInfoListDTO> getEmailInfoList (EmailInfoSearchDTO searchDTO, Sort sort);

	void addInterestedBook(String mid, AddInterestedBookDTO addInteredtedBookDto);
	
	Page<InterestedBookResponseDTO> getInterestedBookList(Pageable pageable, InterestedBookRequestDTO interestedBookRequestDto, String mid);
	
	void deleteInterestedBook(InteresdtedBookDeleteDTO interesdtedBookDeleteDto, String mid);
	
	Page<EbookMemberResponseDTO> getMyEbookList(Pageable pageable, EbookMemberRequestDTO dto, String mid);
	
	void deleteMyEbook(EbookMemberDeleteDTO dto, String mid);
	
	ChatMemberBorrowResponseDTO getChatMemberBorrowState(String mid);
	
	ChatMemberReservationResponseDTO getChatMemberReservationState(String mid);
	
	List<GenderCountDTO> getGenderCount();
	
	List<AgeCountDTO> getAgeCount();
	
	List<RegionCountDTO> getRegionCount();
	
	void sendBookReturnNotification();
	
	void deletePlaceProgram(String mid);

	boolean isBorrowedMember(String mid);

	void cancelAllReservesForMember(String mid);
	
	void leaveMember(String mid);
	
	boolean checkPhoneIdMember(String mid, String phone);
	
}
