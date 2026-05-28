package com.peakfit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Erreur de validation.");
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    // Business-logic exceptions
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(Map.of("error", ex.getMessage()));
    }

    // Catch-all — prints the REAL error to console
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        // Print full stack trace to IntelliJ console
        ex.printStackTrace();
        System.err.println("=== PEAKFIT ERROR ===");
        System.err.println("Type   : " + ex.getClass().getName());
        System.err.println("Message: " + ex.getMessage());
        if (ex.getCause() != null) {
            System.err.println("Cause  : " + ex.getCause().getMessage());
        }
        System.err.println("=====================");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error",   "Erreur serveur.",
                        "details", ex.getMessage() != null ? ex.getMessage() : ex.getClass().getName()
                ));
    }
}