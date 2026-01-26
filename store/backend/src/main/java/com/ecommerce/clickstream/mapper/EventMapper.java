package com.ecommerce.clickstream.mapper;

import com.ecommerce.clickstream.dto.ClickstreamEventDTO;
import com.ecommerce.clickstream.model.ClickstreamEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event Mapper for DTO <-> Entity conversion.
 * 
 */
@Component
public class EventMapper {
    
    public ClickstreamEvent toEntity(ClickstreamEventDTO dto) {
        return ClickstreamEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .userId(dto.getUserId())
                .sessionId(dto.getSessionId())
                .eventType(dto.getEventType())
                .productId(dto.getProductId())
                .productName(dto.getProductName())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .searchQuery(dto.getSearchQuery())
                .timestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now())
                .userAgent(dto.getUserAgent())
                .ipAddress(dto.getIpAddress())
                .referrer(dto.getReferrer())
                .build();
    }
    
    public ClickstreamEventDTO toDTO(ClickstreamEvent entity) {
        return ClickstreamEventDTO.builder()
                .userId(entity.getUserId())
                .sessionId(entity.getSessionId())
                .eventType(entity.getEventType())
                .productId(entity.getProductId())
                .productName(entity.getProductName())
                .category(entity.getCategory())
                .price(entity.getPrice())
                .quantity(entity.getQuantity())
                .searchQuery(entity.getSearchQuery())
                .timestamp(entity.getTimestamp())
                .userAgent(entity.getUserAgent())
                .ipAddress(entity.getIpAddress())
                .referrer(entity.getReferrer())
                .build();
    }
}
