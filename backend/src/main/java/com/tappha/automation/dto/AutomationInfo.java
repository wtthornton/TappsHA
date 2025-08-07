package com.tappha.automation.dto;

import com.tappha.automation.entity.Automation;
import com.tappha.automation.entity.AutomationVersion;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for complete automation information with versions and status
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationInfo {

    private Automation automation;
    private List<AutomationVersion> versions;
    private AutomationVersion currentVersion;
    private ApprovalStatus approvalStatus;
    private OptimizationStatus optimizationStatus;
} 