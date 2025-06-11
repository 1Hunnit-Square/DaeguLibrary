package com.dglib;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DglibApplication {

	public static void main(String[] args) {
		SpringApplication.run(DglibApplication.class, args);
	}

}
