package com.dglib.repository.place;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.place.Place;

public interface PlaceRepository extends JpaRepository<Place, Long> {

	// 회원 mid 기준 신청 내역
	List<Place> findByMember_Mid(String mid);

	// 예약 시간대 중복 확인
	boolean existsByRoomAndUseDateAndStartTime(String room, LocalDate useDate, LocalTime startTime);

	// 간편한 예약 중복 확인
	default boolean existsBySchedule(String room, LocalDate date, LocalTime time) {
		return existsByRoomAndUseDateAndStartTime(room, date, time);
	}

	// 동일 시설 중복 예약
	boolean existsByMember_MidAndRoomAndUseDate(String mid, String room, LocalDate useDate);

	// 회원의 날짜별 예약 내역
	List<Place> findByMember_MidAndUseDate(String memberMid, LocalDate useDate);

	// 시설의 날짜별 예약 내역
	List<Place> findByRoomAndUseDate(String room, LocalDate useDate);

	// 월별 날짜/공간별 총 예약시간 (분 단위)
	@Query("""
			    SELECT p.useDate, p.room, SUM(p.durationTime * 60)
			    FROM Place p
			    WHERE FUNCTION('YEAR', p.useDate) = :year AND FUNCTION('MONTH', p.useDate) = :month
			    GROUP BY p.useDate, p.room
			""")
	List<Object[]> sumReservedMinutesByDateAndRoom(@Param("year") int year, @Param("month") int month);
}
