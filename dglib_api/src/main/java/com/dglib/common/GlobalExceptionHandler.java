package com.dglib.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.dglib.security.jwt.JwtException;


@ControllerAdvice
public class GlobalExceptionHandler {
	
	
	@ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        ErrorResponse error = new ErrorResponse("예약 처리 실패", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
	
	@ExceptionHandler(JwtException.class)
	public ResponseEntity<ErrorResponse> handleJWTException(JwtException ex) {
		ErrorResponse error = new ErrorResponse("REFRESH_ERROR", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ErrorResponse> handleException(RuntimeException ex) {
		ErrorResponse error = new ErrorResponse("RUNTIME_ERROR", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}

}