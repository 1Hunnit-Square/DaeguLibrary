package com.dglib.common;

import lombok.Data;

@Data
public class ErrorResponse {
	private String error;
    private String message;

    public ErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
    }

}
