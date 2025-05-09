package com.dglib.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		
		http.cors(httpSecurityCorsConfigurer -> {
		    httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
		    });
		
		 http.sessionManagement(sessionConfig ->
		    sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		
		http.csrf(config -> config.disable()); 
		
		http.formLogin(config -> {
	        config.loginPage("/api/member/login");
	        });
		
		return http.build();
	}
	

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
	
	CorsConfiguration configuration = new CorsConfiguration();
	
	configuration.setAllowedOriginPatterns(Arrays.asList("*"));
	configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
	configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
	configuration.setAllowCredentials(true);
	
	UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	source.registerCorsConfiguration("/**", configuration);
	
	return source;
	}
	

}
