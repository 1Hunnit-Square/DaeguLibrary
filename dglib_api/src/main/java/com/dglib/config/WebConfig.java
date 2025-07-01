package com.dglib.config;




import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.simplejavamail.api.mailer.Mailer;
import org.simplejavamail.api.mailer.config.TransportStrategy;
import org.simplejavamail.mailer.MailerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
	
	private final Intercepter intercepter;
	
	private static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
	


	
	
	@Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(intercepter)
                .addPathPatterns("/api/chatbotpy/**");
                
    }
	
	@Bean
	WebClient webClient() {
		return WebClient.builder()
				.exchangeStrategies(ExchangeStrategies.builder()
						.codecs(configurer -> configurer.defaultCodecs()
								.maxInMemorySize(-1))
						.build())
				.baseUrl("https://dglib-python.fly.dev")
				.build();
	}
	
	@Bean
	WebClient webClientChat() {
		return WebClient.builder()
				.exchangeStrategies(ExchangeStrategies.builder()
						.codecs(configurer -> configurer.defaultCodecs()
								.maxInMemorySize(-1))
						.build())
				.baseUrl("https://crisp-beloved-seasnail.ngrok-free.app")
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

	 @Bean
	    public Mailer mailer(@Value("${mail.smtp.host}") String smtpHost) {
		 Properties props = new Properties();
		 props.put("mail.smtp.starttls.enable", "false");
		 props.put("mail.smtp.starttls.required", "false");
		 props.put("mail.smtp.ssl.enable", "false");
		 
		 	return MailerBuilder
		 			.withSMTPServerHost(smtpHost)
		 		    .withSMTPServerPort(25)
		 		    .withTransportStrategy(TransportStrategy.SMTP)
		 		    .withDebugLogging(true)
		 		    .withProperties(props)
		 		    .buildMailer();
	    }
    
    @Bean
    public PasswordEncoder passwordEncoder(){

    return new BCryptPasswordEncoder();

    }
    
    @Bean
    public LevenshteinDistance levenshteinDistance() {
        return new LevenshteinDistance();
    }

}
