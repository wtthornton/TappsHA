package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation test result
 * Represents the result of testing automation changes in a safe environment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTestResult {
    private boolean success;
    private String errorMessage;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String testType;
    private long testTimestamp;
    private String testId;
    
    // Test execution results
    private boolean testPassed;
    private List<String> testErrors;
    private List<String> testWarnings;
    private Map<String, Object> testResults;
    private List<String> executedScenarios;
    private List<String> failedScenarios;
    
    // Performance test results
    private Map<String, Object> performanceResults;
    private long averageResponseTime;
    private long maxResponseTime;
    private long minResponseTime;
    private int totalRequests;
    private int successfulRequests;
    private int failedRequests;
    
    // Security test results
    private Map<String, Object> securityResults;
    private List<String> securityIssues;
    private List<String> securityWarnings;
    private Map<String, Object> vulnerabilityAssessment;
    
    // Load test results
    private Map<String, Object> loadTestResults;
    private int concurrentUsers;
    private long throughput;
    private Map<String, Object> resourceUsage;
    
    // Test metadata
    private Map<String, Object> testMetadata;
    private String testEnvironment;
    private long testDuration;
    private Map<String, Object> testConfiguration;
    private boolean canDeploy;
    private String deploymentReason;
}
