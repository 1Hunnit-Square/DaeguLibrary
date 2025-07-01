package com.dglib.service.metrics;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.dglib.dto.metrics.ConnectionDTO;
import com.dglib.dto.metrics.CpuDTO;
import com.dglib.dto.metrics.MemoryDTO;
import com.dglib.dto.metrics.NetworkDTO;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MetricsService {

	final String USER = "creation";
	
	@Value("${server.creation.password}")
	String PASSWORD;
	
	@Value("${monitor.api.url}")
	String URL;
	
	@Value("${main.host.url}")
	String HOST;
	
	public List<CpuDTO> getCpuMetrics() {
		String PATH = "/api/4/percpu";
		
		ResponseEntity<List<Map<String, Object>>> response = getResponse(PATH, new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        
        List<Map<String, Object>> responseList = response.getBody();
        List<CpuDTO> dtoList = new ArrayList<>();
        
        ObjectMapper objMapper = new ObjectMapper();
   	    objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
   	    objMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
   	        
        if(responseList != null) {

        for(Map<String, Object> cpu : responseList) {
        	CpuDTO dto = objMapper.convertValue(cpu, CpuDTO.class);        	
        	dtoList.add(dto);
        }
        
	}
        return dtoList;
	}
	
	public MemoryDTO getMemoryMetrics() {
		String PATH = "/api/4/mem";
		
        ResponseEntity<Map<String, Object>> response = getResponse(PATH, new ParameterizedTypeReference<Map<String, Object>>() {});
        
        Map<String, Object> responseMap = response.getBody();
        
        ObjectMapper objMapper = new ObjectMapper();
   	    objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
   	    objMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
   	    
   	    MemoryDTO dto = objMapper.convertValue(responseMap, MemoryDTO.class);
   	    
        
        return dto;
		
	}
	
	public NetworkDTO getNetworkMetrics() {
		String PATH = "/api/4/network";
		
		ResponseEntity<List<Map<String, Object>>> response = getResponse(PATH, new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        
        List<Map<String, Object>> responseList = response.getBody();
        List<NetworkDTO> dtoList = new ArrayList<>();
        NetworkDTO result = null;
        String mainNetwork = null;

   	    ObjectMapper objMapper = new ObjectMapper();
   	    objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
   	    objMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
   	        
        if(responseList != null) {

        for(Map<String, Object> network : responseList) {
        	NetworkDTO dto = objMapper.convertValue(network, NetworkDTO.class);
        	if(dto.getInterfaceName().equals("eth0")) {
        		if(dto.getBytesSentRatePerSec() == 0.0 && dto.getBytesRecvRatePerSec() == 0.0) {
        			mainNetwork = "wlan0";
        		} else {
        			mainNetwork = "eth0";
        		}
        	}
        	
        	dtoList.add(dto);
        }
       

        final String selectedNetwork = mainNetwork;
        result = dtoList.stream().filter(dto -> dto.getInterfaceName().equals(selectedNetwork)).findFirst().orElse(null);
       }
        return result;
	}
	
	
	public ConnectionDTO getConnections() {
		String PATH = "/status";
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> response = restTemplate.getForEntity(HOST + PATH, String.class);
		String status = response.getBody();
		
		ConnectionDTO dto = new ConnectionDTO();
		
		Matcher activeMatcher = Pattern.compile("Active connections:\\s+(\\d+)").matcher(status);
	    if (activeMatcher.find()) {
	        dto.setActive(Integer.parseInt(activeMatcher.group(1)));
	    }
	    
	    Matcher otherMatcher = Pattern.compile("Reading:\\s+(\\d+)\\s+Writing:\\s+(\\d+)\\s+Waiting:\\s+(\\d+)").matcher(status);
	    if (otherMatcher.find()) {
	        dto.setReading(Integer.parseInt(otherMatcher.group(1)));
	        dto.setWriting(Integer.parseInt(otherMatcher.group(2)));
	        dto.setWaiting(Integer.parseInt(otherMatcher.group(3)));
	    }
	    
	    return dto;
		
	}
	
	

	<T> ResponseEntity<T> getResponse(String PATH, ParameterizedTypeReference<T> typeRef){
			RestTemplate restTemplate = new RestTemplate();
			
			String auth = USER+":"+PASSWORD;
			String encoded = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
					
			HttpHeaders headers = new HttpHeaders();
		    headers.set("Authorization", "Basic " + encoded);
		    
		    HttpEntity<String> entity = new HttpEntity<>(headers);
		    ResponseEntity<T> response = restTemplate.exchange(URL+PATH, HttpMethod.GET, entity, typeRef);
	    
	    return response;
	}

        
}
