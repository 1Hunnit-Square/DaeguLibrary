package com.dglib.service.days;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.dglib.dto.days.HolidayDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HolidayApiService {

	private final ObjectMapper objectMapper;
	private final RestTemplate restTemplate = new RestTemplate();

	@Value("${holiday.api.key}")
	private String SERVICE_KEY;

	private static final String BASE_URL = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";

	public List<HolidayDTO> fetch(int year, int month) {
		URI uri = UriComponentsBuilder.fromHttpUrl(BASE_URL).queryParam("solYear", year)
				.queryParam("solMonth", String.format("%02d", month)).queryParam("ServiceKey", SERVICE_KEY)
				.queryParam("_type", "json").queryParam("numOfRows", 30).build(true).toUri();

		ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);

		log.info("API 응답 본문 확인: {}", response.getBody());

		if (!response.getHeaders().getContentType().includes(MediaType.APPLICATION_JSON)) {
			throw new RuntimeException("API 응답이 JSON이 아님 → 인증키 또는 파라미터 오류일 수 있음");
		}

		if (response.getStatusCode().is2xxSuccessful()) {
			return parse(response.getBody());
		} else {
			throw new RuntimeException("공휴일 API 호출 실패: " + response.getStatusCode());
		}
	}

	// 연도 전체 공휴일 조회(1~12월 순회)
	public List<HolidayDTO> getHolidays(int year) {
		List<HolidayDTO> result = new ArrayList<>();
		for (int month = 1; month <= 12; month++) {
			result.addAll(fetch(year, month));
		}
		return result;
	}

	// 공휴일 여부 및 이름 확인
	public Optional<HolidayDTO> getHolidayByDate(LocalDate date) {
		int year = date.getYear();
		int month = date.getMonthValue();

		List<HolidayDTO> holidays = fetch(year, month);

		return holidays.stream().filter(dto -> dto.getDate().equals(date)).findFirst();
	}

	// JSON 파싱
	private List<HolidayDTO> parse(String json) {
		List<HolidayDTO> result = new ArrayList<>();
		try {
			log.info("API 응답 원문: {}", json);
			JsonNode root = objectMapper.readTree(json);
			JsonNode itemsNode = root.path("response").path("body").path("items");

			if (itemsNode.isMissingNode() || itemsNode.isEmpty() || itemsNode.toString().equals("\"\"")) {
				return result;
			}

			JsonNode itemNode = itemsNode.path("item");

			if (itemNode.isArray()) {
				for (JsonNode item : itemNode) {
					result.add(parseItem(item));
				}
			} else if (itemNode.isObject()) {
				result.add(parseItem(itemNode));
			}

		} catch (Exception e) {
			log.error("공휴일 JSON 파싱 오류 발생! 응답 본문: {}", json);
			throw new RuntimeException("공휴일 JSON 파싱 오류", e);
		}

		return result;
	}

	// 단일 공휴일 항목을 DTO로 파싱
	private HolidayDTO parseItem(JsonNode item) {
		int locdate = item.path("locdate").asInt(); // 예: 20250505
		String dateName = item.path("dateName").asText(); // 예: "어린이날"
		String isHoliday = item.path("isHoliday").asText(); // 예: "Y"

		LocalDate date = LocalDate.parse(String.valueOf(locdate), DateTimeFormatter.BASIC_ISO_DATE);
		return new HolidayDTO(date, dateName, isHoliday);
	}
}
