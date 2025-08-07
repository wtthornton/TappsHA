package com.tappha.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for approval status data
 * 
 * Contains approval status information including:
 * - Current status
 * - Timestamp for status updates
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStatusDTO {
    
    /**
     * The approval request ID
     */
    private String requestId;
    
    /**
     * Current status (PENDING, APPROVED, REJECTED, DELEGATED)
     */
    private String status;
    
    /**
     * Timestamp when the status was last updated
     */
    private LocalDateTime updatedAt;
} 