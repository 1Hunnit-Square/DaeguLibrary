package com.dglib.dto.metrics;

import lombok.Data;

@Data
public class MemoryDTO {
	private long total;
	private long used;
	private double percent;
}
