package com.dglib.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dglib.security.DeniedHandler;
import com.dglib.security.LoginFailHandler;
import com.dglib.security.LoginSuccessHandler;
import com.dglib.security.jwt.JwtFilter;

@Configuration
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfig {
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, DaoAuthenticationProvider authenticationProvider) throws Exception {
		
		http.cors(httpSecurityCorsConfigurer -> {
		    httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource());
		    });
		
		 http.sessionManagement(sessionConfig ->
		    sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		
		http.csrf(config -> config.disable()); 
		
		http.authenticationProvider(authenticationProvider);
		
		http.formLogin(config -> {
	        config.loginProcessingUrl("/api/member/login");
	        config.successHandler(new LoginSuccessHandler());
	        config.failureHandler(new LoginFailHandler());
	        });
		
		 http.addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class);
		
		 http.exceptionHandling(config -> { 
		        config.accessDeniedHandler(new DeniedHandler());
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
	
	@Bean
	public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
	    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
	    provider.setUserDetailsService(userDetailsService);
	    provider.setPasswordEncoder(passwordEncoder);
	    provider.setHideUserNotFoundExceptions(false); // Exception 커스텀 가능
	    return provider;
	}

}
