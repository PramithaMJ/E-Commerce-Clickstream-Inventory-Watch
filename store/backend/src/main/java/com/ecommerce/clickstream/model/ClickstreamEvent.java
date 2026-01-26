package com.ecommerce.clickstream.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clickstream Event Domain Model.
 * 
 * Represents a user interaction event in the e-commerce store.
 * This is the internal domain model sent to Kafka.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickstreamEvent {
    
    @JsonProperty("event_id")
    private String eventId;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("session_id")
    private String sessionId;
    
    @JsonProperty("event_type")
    private String eventType;
    
    @JsonProperty("product_id")
    private String productId;
    
    @JsonProperty("product_name")
    private String productName;
    
    @JsonProperty("category")
    private String category;
    
    @JsonProperty("price")
    private BigDecimal price;
    
    @JsonProperty("quantity")
    private Integer quantity;
    
    @JsonProperty("search_query")
    private String searchQuery;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("user_agent")
    private String userAgent;
    
    @JsonProperty("ip_address")
    private String ipAddress;
    
    @JsonProperty("referrer")
    private String referrer;
    
    /**
     * Generate timestamp if not provided.
     */
    public void ensureTimestamp() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
    
    /**
     * Generate session ID if not provided.
     */
    public void ensureSessionId() {
        if (this.sessionId == null || this.sessionId.isEmpty()) {
            this.sessionId = UUID.randomUUID().toString();
        }
    }
}
