package com.dglib.dto.metrics;

import lombok.Data;

@Data
public class NetworkDTO {
	    private String interfaceName;
	    private long bytesSentGauge;
	    private long bytesRecvGauge;
	    private double bytesSentRatePerSec;
	    private double bytesRecvRatePerSec;
}
