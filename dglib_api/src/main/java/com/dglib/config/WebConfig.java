package com.dglib.config;




import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
	private static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**").allowedOrigins("http://localhost:5173")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*").allowCredentials(true);
	}
	
	@Bean
	WebClient webClient() {
		return WebClient.builder()
				.exchangeStrategies(ExchangeStrategies.builder()
						.codecs(configurer -> configurer.defaultCodecs()
								.maxInMemorySize(-1))
						.build())
				.baseUrl("http://localhost:8000")
				.build();
	}
	
	 @Bean
	    public ModelMapper getMapper(){
	        ModelMapper modelMapper = new ModelMapper();
	        modelMapper.getConfiguration()
	        .setFieldMatchingEnabled(true)
	        .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
	        .setMatchingStrategy(MatchingStrategies.STRICT);

	        return modelMapper;
	   }
	 @Bean
	    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
	        return builder -> {
	           
	            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATETIME_FORMAT);
	            JavaTimeModule javaTimeModule = new JavaTimeModule();
	            javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(formatter));

	            builder.modules(javaTimeModule); 
	        };
	 }

	


}
