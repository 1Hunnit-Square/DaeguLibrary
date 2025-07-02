package com.dglib.controller.metrics;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dglib.dto.metrics.ConnectionDTO;
import com.dglib.dto.metrics.CpuDTO;
import com.dglib.dto.metrics.MemoryDTO;
import com.dglib.dto.metrics.MetricsDTO;
import com.dglib.dto.metrics.NetworkDTO;
import com.dglib.service.metrics.MetricsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/metrics")
public class MetricsController {

		private final MetricsService metricsService;

		
		@GetMapping("/getMetrics")
		public ResponseEntity<MetricsDTO> getMetrics() {
			
			MetricsDTO dto = MetricsDTO.builder()
			.cpuList(metricsService.getCpuMetrics())
			.network(metricsService.getNetworkMetrics())
			.memory(metricsService.getMemoryMetrics())
			.connection(metricsService.getConnections())
			.sensors(metricsService.getSensors())
			.bootTime(metricsService.getBootTime())
			.build();
			return ResponseEntity.ok(dto);
		}

		@GetMapping("/cpu")
		public ResponseEntity<List<CpuDTO>> getCpuMetrics() {

			return ResponseEntity.ok(metricsService.getCpuMetrics());
		}

		@GetMapping("/memory")
		public ResponseEntity<MemoryDTO> getMemoryMetrics() {

			return ResponseEntity.ok(metricsService.getMemoryMetrics());
		}

		@GetMapping("/network")
		public ResponseEntity<NetworkDTO> getNetworkMetrics() {
			return ResponseEntity.ok(metricsService.getNetworkMetrics());
		}
		
		@GetMapping("/connection")
		public ResponseEntity<ConnectionDTO> getConnections() {
			return ResponseEntity.ok(metricsService.getConnections());
		}

		@GetMapping("/sensors")
		public ResponseEntity<Integer> getSensors() {
			return ResponseEntity.ok(metricsService.getSensors());
		}
		
		@GetMapping("/bootTime")
		public ResponseEntity<LocalDateTime> getBootTime() {
			return ResponseEntity.ok(metricsService.getBootTime());
		}
		

}
