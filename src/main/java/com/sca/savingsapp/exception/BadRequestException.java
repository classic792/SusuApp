package com.sca.savingsapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    // Custom exception mapped to 400 Bad Request HTTP status
    public BadRequestException(String message) {
        super(message);
    }
}
