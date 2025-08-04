package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for Home Assistant connection data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionDto {
    
    private UUID connectionId;
    private String name;
    private String url;
    private String status;
    private String homeAssistantVersion;
    private OffsetDateTime lastConnected;
    private OffsetDateTime lastSeen;
    private String websocketStatus;
    private long eventCount;
    private ConnectionHealth healthMetrics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionHealth {
        private long latency;
        private double uptime;
        private double errorRate;
    }
} 