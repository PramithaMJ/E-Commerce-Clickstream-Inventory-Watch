package com.ecommerce.clickstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * E-Commerce Clickstream Store Application.
 * 
 * Spring Boot application that serves as the backend for the electronics store,
 * capturing clickstream events and publishing them to Kafka for real-time analytics.
 */
@SpringBootApplication
public class ClickstreamStoreApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ClickstreamStoreApplication.class, args);
    }
}
