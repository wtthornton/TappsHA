package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for connection test
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionTestResponse {
    
    private UUID connectionId;
    private boolean success;
    private String version;
    private boolean apiAccess;
    private boolean websocketAccess;
    private boolean eventSubscription;
    private long latency;
    private String errorMessage;
    private TestResults testResults;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResults {
        private boolean apiAccess;
        private boolean websocketAccess;
        private boolean eventSubscription;
        private long latency;
    }
} 