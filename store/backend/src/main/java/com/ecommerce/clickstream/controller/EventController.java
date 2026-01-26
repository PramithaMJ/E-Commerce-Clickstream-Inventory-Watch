package com.ecommerce.clickstream.controller;

import com.ecommerce.clickstream.dto.ApiResponse;
import com.ecommerce.clickstream.dto.ClickstreamEventDTO;
import com.ecommerce.clickstream.service.EventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Event Controller for Clickstream Tracking.
 * 
 * Presentation layer following REST best practices.
 * Uses service layer for business logic delegation.
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {
    
    private final EventService eventService;
    
    /**
     * Receive and publish a clickstream event.
     * 
     * @param eventDTO The clickstream event DTO from the frontend
     * @param request HTTP request for extracting metadata
     * @return Success response
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackEvent(
            @Valid @RequestBody ClickstreamEventDTO eventDTO,
            HttpServletRequest request) {
        
        log.info("Received event: userId={}, productId={}, type={}", 
                eventDTO.getUserId(), eventDTO.getProductId(), eventDTO.getEventType());
        
        // Enrich with request metadata
        eventDTO.setUserAgent(request.getHeader("User-Agent"));
        eventDTO.setIpAddress(request.getRemoteAddr());
        eventDTO.setReferrer(request.getHeader("Referer"));
        
        // Process through service layer
        eventService.processEvent(eventDTO);
        
        Map<String, Object> response = Map.of(
                "eventType", eventDTO.getEventType(),
                "productId", eventDTO.getProductId()
        );
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Event tracked successfully"));
    }
    
    /**
     * Batch event tracking for multiple events.
     * 
     * @param events List of clickstream event DTOs
     * @return Success response with count
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackEvents(
            @Valid @RequestBody List<ClickstreamEventDTO> events) {
        
        log.info("Received batch of {} events", events.size());
        
        events.forEach(eventService::processEvent);
        
        Map<String, Object> response = Map.of(
                "count", events.size()
        );
        
        return ResponseEntity.ok(
                ApiResponse.success(response, "Events tracked successfully")
        );
    }
    
    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of("status", "UP", "service", "clickstream-event-api"),
                        "Service is healthy"
                )
        );
    }
}
