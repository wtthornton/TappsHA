package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Response DTO for connection status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionStatusResponse {
    
    private UUID connectionId;
    private String status;
    private String homeAssistantVersion;
    private ConnectionHealth connectionHealth;
    private PerformanceMetrics performanceMetrics;
    private OffsetDateTime lastConnected;
    private OffsetDateTime lastSeen;
    private String websocketStatus;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionHealth {
        private long latency;
        private double uptime;
        private double errorRate;
        private OffsetDateTime lastSeen;
        private long eventRate;
        private String websocketStatus;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private double cpuUsage;
        private double memoryUsage;
        private long eventProcessingLatency;
    }
} 