package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation alert data
 * 
 * Contains alert information for automation monitoring
 * including alert type, severity, message, and timestamp
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationAlertDTO {
    
    /**
     * The automation ID that triggered the alert
     */
    private String automationId;
    
    /**
     * Type of alert (HIGH_FAILURE_RATE, SLOW_RESPONSE_TIME, STALE_AUTOMATION, etc.)
     */
    private String alertType;
    
    /**
     * Alert severity (INFO, WARNING, ERROR, CRITICAL)
     */
    private String severity;
    
    /**
     * Human-readable alert message
     */
    private String message;
    
    /**
     * Timestamp when alert was generated
     */
    private LocalDateTime timestamp;
} 