package com.dglib.scheduler;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.dglib.service.book.BookService;
import com.dglib.service.days.ClosedDayService;
import com.dglib.service.member.MemberService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class Scheduler {
	
	private final Logger LOGGER = LoggerFactory.getLogger(Scheduler.class);
	private static final Logger overdueLogger = LoggerFactory.getLogger("OverdueLogger");
	private final MemberService memberService;
	private final BookService bookService;
	private final ClosedDayService closedDayService;

	
	
	@Scheduled(cron = "00 00 00 * * *", zone = "Asia/Seoul")
	public void OverdueScheduler() {
		try {
			memberService.executeOverdueCheck();
			overdueLogger.info("도서 연체 회원이 성공적으로 업데이트되었습니다.");
			LOGGER.info("도서 연체 회원이 성공적으로 업데이트되었습니다.");
		} catch (Exception e) {
			overdueLogger.error("도서 연체 회원 업데이트 중 오류 발생: {}", e.getMessage());
			
		}
		
	}
	
	@Scheduled(cron = "00 05 00 * * *", zone = "Asia/Seoul")
    public void updateTopBooksCache() {
        try {
            bookService.updateTopBooksCache();
            LOGGER.info("대출 베스트 도서 캐시가 성공적으로 업데이트되었습니다.");
        } catch (Exception e) {
            LOGGER.error("대출 베스트 도서 캐시 업데이트 중 오류 발생: {}", e.getMessage());
        }
    }
	
	@Scheduled(cron = "00 10 00 * * *", zone = "Asia/Seoul")
	public void updatePopularKeywordCache() {
		try {
			bookService.updatePopularKeywordCache();
			LOGGER.info("인기 검색어 캐시가 성공적으로 업데이트되었습니다.");
		} catch (Exception e) {
			LOGGER.error("인기 검색어 캐시 업데이트 중 오류 발생: {}", e.getMessage());
		}
	}
	
	@Scheduled(cron = "0 15 0 * * *", zone = "Asia/Seoul")
	public void deleteKeywordfingerPrint() {
		bookService.deleteKeywordFingerprint();
	}
	
	@Scheduled(cron = "0 20 0 * * MON", zone = "Asia/Seoul")
	public void deletePopularKeyword() {
		bookService.deleteKeyword();
	}
	
	@Scheduled(cron = "0 0 0 1 * *", zone = "Asia/Seoul")
	public void autoRegisterClosedDay() {
		int year = LocalDate.now().getYear();
		try {
			closedDayService.registerAllAutoEventsForYear(year);
			LOGGER.info("{}년도 자동 등록 완료", year);
		} catch (Exception e) {
			LOGGER.error("{}년도 자동 등록 실패: {}", year, e.getMessage(), e);
		}
	}
	
	@Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
	public void bookReturnSmsScheduler() {
		try {
			memberService.sendBookReturnNotification();
			LOGGER.info("연체 알림 SMS가 성공적으로 전송되었습니다.");
		} catch (Exception e) {
			LOGGER.error("연체 알림 SMS 전송 중 오류 발생: {}", e.getMessage());
		}
	}
}
