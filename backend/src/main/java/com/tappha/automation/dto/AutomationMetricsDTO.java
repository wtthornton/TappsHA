package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for automation metrics data
 * 
 * Contains comprehensive metrics for monitoring automation performance
 * including execution counts, failure rates, response times, and status
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationMetricsDTO {
    
    /**
     * Total number of automations in the system
     */
    private Integer totalAutomations;
    
    /**
     * Number of active automations
     */
    private Integer activeAutomations;
    
    /**
     * Map of automation ID to execution count
     */
    private Map<String, Long> executionCounts;
    
    /**
     * Map of automation ID to failure count
     */
    private Map<String, Long> failureCounts;
    
    /**
     * Map of automation ID to average response time in milliseconds
     */
    private Map<String, Double> averageResponseTimes;
    
    /**
     * Map of automation ID to last execution timestamp
     */
    private Map<String, Long> lastExecutionTimes;
    
    /**
     * Timestamp when metrics were collected
     */
    private LocalDateTime timestamp;
} 