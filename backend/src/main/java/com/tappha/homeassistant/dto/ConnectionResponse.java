package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for connection operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionResponse {
    
    private boolean success;
    private UUID connectionId;
    private String status;
    private String homeAssistantVersion;
    private String[] supportedFeatures;
    private ConnectionHealth connectionHealth;
    private String errorMessage;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionHealth {
        private long latency;
        private OffsetDateTime lastSeen;
    }
} 