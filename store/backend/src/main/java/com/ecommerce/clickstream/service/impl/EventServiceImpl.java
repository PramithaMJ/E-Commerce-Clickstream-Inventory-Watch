package com.ecommerce.clickstream.service.impl;

import com.ecommerce.clickstream.dto.ClickstreamEventDTO;
import com.ecommerce.clickstream.mapper.EventMapper;
import com.ecommerce.clickstream.model.ClickstreamEvent;
import com.ecommerce.clickstream.service.EventService;
import com.ecommerce.clickstream.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Event Service Implementation.
 * 
 * Implements business logic for event processing.
 * Follows Single Responsibility Principle - handles event validation and orchestration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {
    
    private final KafkaProducerService kafkaProducerService;
    private final EventMapper eventMapper;
    
    @Override
    public void processEvent(ClickstreamEventDTO eventDTO) {
        log.debug("Processing event: userId={}, productId={}, type={}", 
                eventDTO.getUserId(), eventDTO.getProductId(), eventDTO.getEventType());
        
        // Enrich event with timestamp if not present
        if (eventDTO.getTimestamp() == null) {
            eventDTO.setTimestamp(LocalDateTime.now());
        }
        
        // Validate event
        if (!validateEvent(eventDTO)) {
            throw new IllegalArgumentException("Invalid event data");
        }
        
        // Map DTO to domain model
        ClickstreamEvent event = eventMapper.toEntity(eventDTO);
        
        // Publish to Kafka
        kafkaProducerService.sendEvent(event);
        
        log.info("Event processed successfully: eventId={}, type={}", 
                event.getEventId(), event.getEventType());
    }
    
    @Override
    public boolean validateEvent(ClickstreamEventDTO eventDTO) {
        // Business validation logic
        return eventDTO.getUserId() != null && 
               eventDTO.getSessionId() != null &&
               eventDTO.getEventType() != null &&
               eventDTO.getProductId() != null;
    }
}
