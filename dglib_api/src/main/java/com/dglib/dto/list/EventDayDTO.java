package com.dglib.dto.list;

import java.time.LocalDate;

import lombok.Data;

@Data
public class EventDayDTO {

	private Long eventNo;
	private LocalDate eventDate;
	private String eventType;
	private String eventName;
}
