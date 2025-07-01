package com.dglib.dto.metrics;

import lombok.Data;

@Data
public class ConnectionDTO {
 private int active;
 private int reading;
 private int writing;
 private int waiting;
}
