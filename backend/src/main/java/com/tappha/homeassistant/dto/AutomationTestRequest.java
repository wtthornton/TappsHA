package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation test request
 * Represents a request to test automation changes in a safe environment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTestRequest {
    private String automationId;
    private String userId;
    private UUID connectionId;
    private String testType; // unit, integration, simulation, dry_run
    private Map<String, Object> testConfiguration;
    private Map<String, Object> testData;
    private List<String> testScenarios;
    private Map<String, Object> testEnvironment;
    private boolean includePerformanceTesting;
    private boolean includeSecurityTesting;
    private boolean includeLoadTesting;
    private Map<String, Object> testOptions;
    private Map<String, Object> metadata;
}
