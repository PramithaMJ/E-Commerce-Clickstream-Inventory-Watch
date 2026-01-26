package com.ecommerce.clickstream.service;

import com.ecommerce.clickstream.model.ClickstreamEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka Producer Service.
 * 
 * Infrastructure layer service handling Kafka message publishing.
 * Serializes events and manages Kafka communication.
 */
@Service
@Slf4j
public class KafkaProducerService {
    
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${app.kafka.clickstream-topic}")
    private String clickstreamTopic;
    
    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    /**
     * Send a clickstream event to Kafka asynchronously.
     * 
     * @param event The clickstream event to send
     * @return CompletableFuture with the send result
     */
    public CompletableFuture<SendResult<String, String>> sendEvent(ClickstreamEvent event) {
        // Ensure timestamp and session ID are set
        event.ensureTimestamp();
        event.ensureSessionId();
        
        try {
            String message = objectMapper.writeValueAsString(event);
            String key = event.getProductId(); // Partition by product for ordering
            
            log.info("Sending event to Kafka: productId={}, eventType={}, eventId={}", 
                    event.getProductId(), event.getEventType(), event.getEventId());
            
            return kafkaTemplate.send(clickstreamTopic, key, message)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to send event to Kafka: {}", ex.getMessage(), ex);
                        } else {
                            log.debug("Event sent successfully: partition={}, offset={}", 
                                    result.getRecordMetadata().partition(),
                                    result.getRecordMetadata().offset());
                        }
                    });
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    /**
     * Send a clickstream event synchronously (blocking).
     * 
     * @param event The clickstream event to send
     * @throws Exception if sending fails
     */
    public void sendEventSync(ClickstreamEvent event) throws Exception {
        sendEvent(event).get();
    }
}
