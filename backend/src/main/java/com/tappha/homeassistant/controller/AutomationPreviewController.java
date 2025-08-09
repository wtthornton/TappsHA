package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AutomationPreviewRequest;
import com.tappha.homeassistant.dto.AutomationPreviewResult;
import com.tappha.homeassistant.dto.AutomationTestRequest;
import com.tappha.homeassistant.dto.AutomationTestResult;
import com.tappha.homeassistant.service.AutomationPreviewService;
import com.tappha.homeassistant.service.AutomationTestingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

/**
 * REST Controller for automation preview and testing capabilities
 * Provides endpoints for previewing changes and testing automation modifications
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/automation/preview")
public class AutomationPreviewController {

    private final AutomationPreviewService previewService;
    private final AutomationTestingService testingService;

    public AutomationPreviewController(AutomationPreviewService previewService,
                                     AutomationTestingService testingService) {
        this.previewService = previewService;
        this.testingService = testingService;
    }

    /**
     * Preview automation changes
     */
    @PostMapping("/changes")
    public ResponseEntity<AutomationPreviewResult> previewAutomationChanges(@RequestBody AutomationPreviewRequest request) {
        log.info("Received preview request for automation: {} by user: {}", 
                request.getAutomationId(), request.getUserId());

        try {
            AutomationPreviewResult result = previewService.previewAutomationChanges(request);

            if (result.isSuccess()) {
                log.info("Successfully previewed automation changes for automation: {} with preview ID: {}", 
                        request.getAutomationId(), result.getPreviewId());
                return ResponseEntity.ok(result);
            } else {
                log.warn("Failed to preview automation changes for automation: {} - {}", 
                        request.getAutomationId(), result.getErrorMessage());
                return ResponseEntity.badRequest().body(result);
            }

        } catch (Exception e) {
            log.error("Error previewing automation changes for automation: {}", request.getAutomationId(), e);
            return ResponseEntity.internalServerError().body(
                    AutomationPreviewResult.builder()
                            .success(false)
                            .errorMessage("Internal server error: " + e.getMessage())
                            .automationId(request.getAutomationId())
                            .connectionId(request.getConnectionId())
                            .userId(request.getUserId())
                            .build()
            );
        }
    }

    /**
     * Get preview result by ID
     */
    @GetMapping("/result/{previewId}")
    public ResponseEntity<AutomationPreviewResult> getPreviewResult(@PathVariable String previewId) {
        log.info("Getting preview result: {}", previewId);

        try {
            AutomationPreviewResult result = previewService.getPreviewResult(previewId);

            if (result != null) {
                log.info("Successfully retrieved preview result: {}", previewId);
                return ResponseEntity.ok(result);
            } else {
                log.warn("Preview result not found: {}", previewId);
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting preview result: {}", previewId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get preview history for an automation
     */
    @GetMapping("/history/{automationId}")
    public ResponseEntity<List<AutomationPreviewResult>> getPreviewHistory(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting preview history for automation: {}", automationId);

        try {
            List<AutomationPreviewResult> history = previewService.getPreviewHistory(automationId, connectionId);
            return ResponseEntity.ok(history);

        } catch (Exception e) {
            log.error("Error getting preview history for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Test automation changes
     */
    @PostMapping("/test")
    public ResponseEntity<AutomationTestResult> testAutomationChanges(@RequestBody AutomationTestRequest request) {
        log.info("Received test request for automation: {} by user: {} with type: {}", 
                request.getAutomationId(), request.getUserId(), request.getTestType());

        try {
            AutomationTestResult result = testingService.testAutomationChanges(request);

            if (result.isSuccess()) {
                log.info("Successfully completed automation testing for automation: {} with test ID: {}", 
                        request.getAutomationId(), result.getTestId());
                return ResponseEntity.ok(result);
            } else {
                log.warn("Failed to test automation changes for automation: {} - {}", 
                        request.getAutomationId(), result.getErrorMessage());
                return ResponseEntity.badRequest().body(result);
            }

        } catch (Exception e) {
            log.error("Error testing automation changes for automation: {}", request.getAutomationId(), e);
            return ResponseEntity.internalServerError().body(
                    AutomationTestResult.builder()
                            .success(false)
                            .errorMessage("Internal server error: " + e.getMessage())
                            .automationId(request.getAutomationId())
                            .connectionId(request.getConnectionId())
                            .userId(request.getUserId())
                            .testType(request.getTestType())
                            .build()
            );
        }
    }

    /**
     * Get test result by ID
     */
    @GetMapping("/test/result/{testId}")
    public ResponseEntity<AutomationTestResult> getTestResult(@PathVariable String testId) {
        log.info("Getting test result: {}", testId);

        try {
            AutomationTestResult result = testingService.getTestResult(testId);

            if (result != null) {
                log.info("Successfully retrieved test result: {}", testId);
                return ResponseEntity.ok(result);
            } else {
                log.warn("Test result not found: {}", testId);
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting test result: {}", testId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get test history for an automation
     */
    @GetMapping("/test/history/{automationId}")
    public ResponseEntity<List<AutomationTestResult>> getTestHistory(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting test history for automation: {}", automationId);

        try {
            List<AutomationTestResult> history = testingService.getTestHistory(automationId, connectionId);
            return ResponseEntity.ok(history);

        } catch (Exception e) {
            log.error("Error getting test history for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available test types
     */
    @GetMapping("/test/types")
    public ResponseEntity<Map<String, Object>> getAvailableTestTypes() {
        log.info("Getting available test types");

        try {
            Map<String, Object> testTypes = Map.of(
                    "unit", Map.of(
                            "name", "Unit Tests",
                            "description", "Test individual automation components",
                            "duration", "30 seconds",
                            "coverage", "Component-level validation"
                    ),
                    "integration", Map.of(
                            "name", "Integration Tests",
                            "description", "Test automation workflows and interactions",
                            "duration", "2 minutes",
                            "coverage", "Workflow validation"
                    ),
                    "simulation", Map.of(
                            "name", "Simulation Tests",
                            "description", "Simulate automation behavior without affecting production",
                            "duration", "1 minute",
                            "coverage", "Behavior simulation"
                    ),
                    "dry_run", Map.of(
                            "name", "Dry Run Tests",
                            "description", "Execute automation without making actual changes",
                            "duration", "45 seconds",
                            "coverage", "Execution validation"
                    )
            );

            return ResponseEntity.ok(testTypes);

        } catch (Exception e) {
            log.error("Error getting available test types", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get preview capabilities
     */
    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> getPreviewCapabilities() {
        log.info("Getting preview capabilities");

        try {
            Map<String, Object> capabilities = Map.of(
                    "preview", Map.of(
                            "name", "Change Preview",
                            "description", "Preview automation changes before applying",
                            "features", List.of("Configuration comparison", "Change visualization", "Impact analysis")
                    ),
                    "validation", Map.of(
                            "name", "Validation",
                            "description", "Validate automation configuration",
                            "features", List.of("Syntax validation", "Semantic validation", "Error detection")
                    ),
                    "simulation", Map.of(
                            "name", "Simulation",
                            "description", "Simulate automation behavior",
                            "features", List.of("Trigger simulation", "Condition simulation", "Action simulation")
                    ),
                    "impact_analysis", Map.of(
                            "name", "Impact Analysis",
                            "description", "Analyze impact of changes",
                            "features", List.of("Affected entities", "Potential conflicts", "Risk assessment")
                    ),
                    "testing", Map.of(
                            "name", "Testing",
                            "description", "Test automation changes",
                            "features", List.of("Unit testing", "Integration testing", "Performance testing", "Security testing")
                    )
            );

            return ResponseEntity.ok(capabilities);

        } catch (Exception e) {
            log.error("Error getting preview capabilities", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Cleanup old preview results
     */
    @PostMapping("/cleanup/previews")
    public ResponseEntity<Map<String, Object>> cleanupOldPreviews() {
        log.info("Cleaning up old preview results");

        try {
            previewService.cleanupOldPreviews();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Old preview results cleaned up successfully"
            ));

        } catch (Exception e) {
            log.error("Error cleaning up old preview results", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }

    /**
     * Cleanup old test results
     */
    @PostMapping("/cleanup/tests")
    public ResponseEntity<Map<String, Object>> cleanupOldTests() {
        log.info("Cleaning up old test results");

        try {
            testingService.cleanupOldTests();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Old test results cleaned up successfully"
            ));

        } catch (Exception e) {
            log.error("Error cleaning up old test results", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()
            ));
        }
    }

    /**
     * Get preview statistics
     */
    @GetMapping("/statistics/{automationId}")
    public ResponseEntity<Map<String, Object>> getPreviewStatistics(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        log.info("Getting preview statistics for automation: {}", automationId);

        try {
            List<AutomationPreviewResult> previewHistory = previewService.getPreviewHistory(automationId, connectionId);
            List<AutomationTestResult> testHistory = testingService.getTestHistory(automationId, connectionId);

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("automationId", automationId);
            statistics.put("connectionId", connectionId);
            statistics.put("totalPreviews", previewHistory.size());
            statistics.put("totalTests", testHistory.size());
            statistics.put("successfulPreviews", previewHistory.stream().filter(AutomationPreviewResult::isSuccess).count());
            statistics.put("successfulTests", testHistory.stream().filter(AutomationTestResult::isTestPassed).count());
            statistics.put("averagePreviewTime", calculateAveragePreviewTime(previewHistory));
            statistics.put("averageTestTime", calculateAverageTestTime(testHistory));
            statistics.put("mostCommonTestType", findMostCommonTestType(testHistory));
            statistics.put("previewSuccessRate", calculatePreviewSuccessRate(previewHistory));
            statistics.put("testSuccessRate", calculateTestSuccessRate(testHistory));

            return ResponseEntity.ok(statistics);

        } catch (Exception e) {
            log.error("Error getting preview statistics for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error: " + e.getMessage(),
                    "automationId", automationId
            ));
        }
    }

    // Helper methods for statistics

    private long calculateAveragePreviewTime(List<AutomationPreviewResult> previewHistory) {
        if (previewHistory.isEmpty()) {
            return 0;
        }
        return previewHistory.stream()
                .mapToLong(result -> System.currentTimeMillis() - result.getPreviewTimestamp())
                .sum() / previewHistory.size();
    }

    private long calculateAverageTestTime(List<AutomationTestResult> testHistory) {
        if (testHistory.isEmpty()) {
            return 0;
        }
        return testHistory.stream()
                .mapToLong(AutomationTestResult::getTestDuration)
                .sum() / testHistory.size();
    }

    private String findMostCommonTestType(List<AutomationTestResult> testHistory) {
        return testHistory.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        AutomationTestResult::getTestType,
                        java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(java.util.Map.Entry::getKey)
                .orElse("unknown");
    }

    private double calculatePreviewSuccessRate(List<AutomationPreviewResult> previewHistory) {
        if (previewHistory.isEmpty()) {
            return 0.0;
        }
        long successfulPreviews = previewHistory.stream().filter(AutomationPreviewResult::isSuccess).count();
        return (double) successfulPreviews / previewHistory.size();
    }

    private double calculateTestSuccessRate(List<AutomationTestResult> testHistory) {
        if (testHistory.isEmpty()) {
            return 0.0;
        }
        long successfulTests = testHistory.stream().filter(AutomationTestResult::isTestPassed).count();
        return (double) successfulTests / testHistory.size();
    }
}
