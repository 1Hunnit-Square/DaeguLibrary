package com.dglib.common;

import java.nio.file.AccessDeniedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.dglib.security.jwt.JwtException;

import jakarta.persistence.EntityNotFoundException;


@ControllerAdvice
public class GlobalExceptionHandler {
	
	
	@ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        ErrorResponse error = new ErrorResponse("예약 처리 실패", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex){
		ErrorResponse error = new ErrorResponse("잘못된 요청 값", ex.getMessage());
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
	
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponse> handleEAccessDenied(AccessDeniedException ex) {
		ErrorResponse error = new ErrorResponse("권한이 없음", ex.getMessage());
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
		ErrorResponse error = new ErrorResponse("엔티티를 찾을 수 없음", ex.getMessage());
		return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
	}
	
	@ExceptionHandler(AuthorizationDeniedException.class)
	public ResponseEntity<ErrorResponse> handleAuthorizationDenied(AuthorizationDeniedException ex) {
		System.out.println("권한이 거부되었습니다: " + ex.getMessage());
		ErrorResponse error = new ErrorResponse("접근 권한이 없습니다.", "접근 권한이 없습니다.");
		return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
	}

}