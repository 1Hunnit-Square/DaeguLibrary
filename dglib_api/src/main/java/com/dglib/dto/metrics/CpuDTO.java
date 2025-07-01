package com.dglib.dto.metrics;

import lombok.Data;

@Data
public class CpuDTO {
 private int cpuNumber; 
 private double total;
 private double user;
 private double system;
 private double idle;
}
