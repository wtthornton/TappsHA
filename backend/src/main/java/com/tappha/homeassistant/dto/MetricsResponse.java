package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for metrics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsResponse {
    
    private UUID connectionId;
    private String timeRange;
    private Metrics metrics;
    private Performance performance;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metrics {
        private long eventCount;
        private double averageLatency;
        private double uptime;
        private double errorRate;
        private long peakEventRate;
        private double averageEventRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Performance {
        private double cpuUsage;
        private double memoryUsage;
        private long eventProcessingLatency;
    }
} 