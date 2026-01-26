package com.ecommerce.clickstream.service;

import com.ecommerce.clickstream.dto.ClickstreamEventDTO;

/**
 * Event Service Interface.
 * 
 * Follows Interface Segregation Principle (SOLID).
 * Defines contract for event processing operations.
 */
public interface EventService {
    
    /**
     * Process and publish a clickstream event.
     * 
     * @param eventDTO The event data transfer object
     */
    void processEvent(ClickstreamEventDTO eventDTO);
    
    /**
     * Validate event data.
     * 
     * @param eventDTO The event to validate
     * @return true if valid, false otherwise
     */
    boolean validateEvent(ClickstreamEventDTO eventDTO);
}
