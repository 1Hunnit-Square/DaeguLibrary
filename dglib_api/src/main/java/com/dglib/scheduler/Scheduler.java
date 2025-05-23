package com.dglib.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.dglib.controller.book.BookController;
import com.dglib.service.book.BookService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class Scheduler {
	
	private final Logger LOGGER = LoggerFactory.getLogger(Scheduler.class);
	private static final Logger overdueLogger = LoggerFactory.getLogger("OverdueLogger");
	private final BookService bookService;
	
	@Scheduled(cron = "00 00 00 * * *", zone = "Asia/Seoul")
	public void OverdueScheduler() {
		try {
			bookService.checkOverdue();
			overdueLogger.info("도서 연체 회원이 성공적으로 업데이트되었습니다.");
			LOGGER.info("도서 연체 회원이 성공적으로 업데이트되었습니다.");
		} catch (Exception e) {
			overdueLogger.error("도서 연체 회원 업데이트 중 오류 발생: {}", e.getMessage());
			
		}
		
		



		
		
	}

}
