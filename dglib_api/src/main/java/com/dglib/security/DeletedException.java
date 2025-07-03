package com.dglib.security;

import org.springframework.security.core.AuthenticationException;

public class DeletedException extends AuthenticationException {
	   public DeletedException(String msg) {
	        super(msg);
	    }

	    public DeletedException(String msg, Throwable cause) {
	        super(msg, cause);
	    }
	
}
