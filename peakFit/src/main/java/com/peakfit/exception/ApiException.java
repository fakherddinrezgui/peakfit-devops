package com.peakfit.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown by services to produce specific HTTP status codes + error messages.
 * Caught by GlobalExceptionHandler and serialized as { "error": "..." }
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
