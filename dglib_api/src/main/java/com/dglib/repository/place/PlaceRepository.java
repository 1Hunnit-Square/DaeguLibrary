package com.dglib.repository.place;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dglib.entity.place.Place;

public interface PlaceRepository extends JpaRepository<Place, Long> {

	// 회원 mid 기준으로 신청 내역 리스트 조회
	List<Place> findByMember_Mid(String mid);

	// 해당 시간대에 이미 예약된 시설이 있는지 확인
	boolean existsByRoomAndUseDateAndStartTime(String room, LocalDate useDate, LocalTime startTime);

	// → 위 메서드의 이름을 아래처럼 줄여서 사용 가능 (사용자 정의 네이밍)
	default boolean existsBySchedule(String room, LocalDate date, LocalTime time) {
		return existsByRoomAndUseDateAndStartTime(room, date, time);
	}

	// 회원이 같은 날, 같은 시설을 이미 예약했는지 확인
	boolean existsByMember_MidAndRoomAndUseDate(String mid, String room, LocalDate useDate);

	// 해당 날짜에 예약한 내역 조회
	List<Place> findByMember_MidAndUseDate(String memberMid, LocalDate useDate);

	// 날짜별, 공간별 예약 건수 조회
	@Query("SELECT p.useDate, p.room, SUM(p.durationTime * 60) "
			+ "FROM Place p WHERE YEAR(p.useDate) = :year AND MONTH(p.useDate) = :month "
			+ "GROUP BY p.useDate, p.room")
	List<Object[]> sumReservedMinutesByDateAndRoom(@Param("year") int year, @Param("month") int month);

}
