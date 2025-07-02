package com.dglib.dto.metrics;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MetricsDTO {
	List<CpuDTO> cpuList;
	ConnectionDTO connection;
	MemoryDTO memory;
	NetworkDTO network;
	int sensors;
	LocalDateTime bootTime;
	
}
