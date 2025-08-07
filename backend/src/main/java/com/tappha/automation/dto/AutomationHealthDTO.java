package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation health check data
 * 
 * Contains health status information for automation services
 * including overall status and individual component health
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationHealthDTO {
    
    /**
     * Overall health status (HEALTHY, UNHEALTHY, ERROR)
     */
    private String overallStatus;
    
    /**
     * Database health status
     */
    private Boolean databaseHealthy;
    
    /**
     * Repository health status
     */
    private Boolean repositoryHealthy;
    
    /**
     * Metrics system health status
     */
    private Boolean metricsHealthy;
    
    /**
     * Timestamp when health check was performed
     */
    private LocalDateTime timestamp;
} 