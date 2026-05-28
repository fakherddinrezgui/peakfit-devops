package com.peakfit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PeakFitApplication {
    public static void main(String[] args) {
        System.out.println("\n  🏋️  PeakFit v2.0 — Spring Boot Backend");
        SpringApplication.run(PeakFitApplication.class, args);
        System.out.println("  🚀  http://localhost:8091n");
    }
}
