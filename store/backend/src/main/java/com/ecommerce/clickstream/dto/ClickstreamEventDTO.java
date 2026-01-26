package com.ecommerce.clickstream.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Clickstream Events.
 * 
 * Includes validation annotations for input validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickstreamEventDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Session ID is required")
    private String sessionId;
    
    @NotBlank(message = "Event type is required")
    @Pattern(regexp = "view|add_to_cart|remove_from_cart|purchase|search|filter", 
            message = "Invalid event type")
    private String eventType;
    
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    private String productName;
    
    private String category;
    
    private BigDecimal price;
    
    private Integer quantity;
    
    private String searchQuery;
    
    private LocalDateTime timestamp;
    
    private String userAgent;
    
    private String ipAddress;
    
    private String referrer;
}
