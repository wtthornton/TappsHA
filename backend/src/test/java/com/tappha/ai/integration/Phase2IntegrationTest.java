package com.tappha.ai.integration;

import com.tappha.ai.dto.*;
import com.tappha.ai.service.*;
import com.tappha.ai.service.impl.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Phase 2 Integration Test Suite
 *
 * Comprehensive integration testing for all Phase 2 components:
 * - PatternAnalysisService (Phase 2.1)
 * - TimeSeriesAnalysisService (Phase 2.2)
 * - RecommendationEngineService (Phase 2.3)
 * - AITransparencyService (Phase 2.4)
 *
 * Tests end-to-end scenarios with real service interactions
 * Following Agent OS Standards with comprehensive validation
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("test")
@Slf4j
class Phase2IntegrationTest {

    @Autowired
    private PatternAnalysisService patternAnalysisService;

    @Autowired
    private TimeSeriesAnalysisService timeSeriesAnalysisService;

    @Autowired
    private RecommendationEngineService recommendationEngineService;

    @Autowired
    private AITransparencyService aiTransparencyService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String TEST_USER_ID = "test-user-123";
    private static final String TEST_DEVICE_ID = "test-device-456";
    private static final String TEST_DECISION_ID = "test-decision-789";

    @BeforeEach
    void setUp() {
        // Clear Redis cache before each test
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }

    @Test
    void testCompleteAIWorkflow_EndToEnd() throws ExecutionException, InterruptedException {
        // **Phase 2.1: Pattern Analysis**
        log.info("=== Starting Phase 2.1: Pattern Analysis ===");
        
        CompletableFuture<PatternAnalysisResult> patternFuture = patternAnalysisService.analyzeDevicePatterns(
            TEST_DEVICE_ID, List.of("24h", "7d", "30d")
        );
        PatternAnalysisResult patternResult = patternFuture.get();
        
        assertNotNull(patternResult);
        assertTrue(patternResult.getSuccess());
        assertNotNull(patternResult.getTimeIntervalPatterns());
        assertNotNull(patternResult.getAnalyzedAt());
        
        log.info("Pattern analysis completed successfully");

        // **Phase 2.2: Time Series Analysis**
        log.info("=== Starting Phase 2.2: Time Series Analysis ===");
        
        CompletableFuture<TimeSeriesData> timeSeriesFuture = timeSeriesAnalysisService.analyzeTimeSeriesData(
            TEST_DEVICE_ID, LocalDateTime.now().minusDays(1), LocalDateTime.now(), "1h"
        );
        TimeSeriesData timeSeriesResult = timeSeriesFuture.get();
        
        assertNotNull(timeSeriesResult);
        assertTrue(timeSeriesResult.getSuccess());
        assertNotNull(timeSeriesResult.getDataPoints());
        assertNotNull(timeSeriesResult.getAggregatedMetrics());
        
        log.info("Time series analysis completed successfully");

        // **Phase 2.3: Recommendation Generation**
        log.info("=== Starting Phase 2.3: Recommendation Generation ===");
        
        RecommendationRequest recommendationRequest = RecommendationRequest.builder()
            .userId(TEST_USER_ID)
            .deviceIds(List.of(TEST_DEVICE_ID))
            .context("energy_optimization")
            .userPreferences("energy_saving")
            .build();
        
        CompletableFuture<RecommendationResponse> recommendationFuture = recommendationEngineService.generateRecommendations(
            recommendationRequest
        );
        RecommendationResponse recommendationResult = recommendationFuture.get();
        
        assertNotNull(recommendationResult);
        assertTrue(recommendationResult.getSuccess());
        assertNotNull(recommendationResult.getRecommendations());
        assertFalse(recommendationResult.getRecommendations().isEmpty());
        assertNotNull(recommendationResult.getStats());
        
        log.info("Recommendation generation completed successfully");

        // **Phase 2.4: Transparency & Safety**
        log.info("=== Starting Phase 2.4: Transparency & Safety ===");
        
        // Log AI activity
        CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
            "RECOMMENDATION_GENERATED", TEST_USER_ID, TEST_DEVICE_ID, 
            recommendationResult, 0.95
        );
        AIActivityLog activityLog = activityFuture.get();
        
        assertNotNull(activityLog);
        assertTrue(activityLog.getSuccess());
        assertEquals("RECOMMENDATION_GENERATED", activityLog.getActivityType());
        assertEquals(TEST_USER_ID, activityLog.getUserId());
        
        // Create decision audit
        CompletableFuture<AIDecisionAudit> auditFuture = aiTransparencyService.createDecisionAudit(
            TEST_DECISION_ID, "AUTOMATION_RECOMMENDATION", 
            recommendationRequest, recommendationResult, 
            "Based on energy consumption patterns", 0.92
        );
        AIDecisionAudit decisionAudit = auditFuture.get();
        
        assertNotNull(decisionAudit);
        assertTrue(decisionAudit.getSuccess());
        assertEquals(TEST_DECISION_ID, decisionAudit.getDecisionId());
        assertEquals("AUTOMATION_RECOMMENDATION", decisionAudit.getDecisionType());
        
        // Generate explanation
        CompletableFuture<AIExplanation> explanationFuture = aiTransparencyService.generateExplanation(
            TEST_DECISION_ID, "AUTOMATION_RECOMMENDATION", 
            recommendationRequest, recommendationResult, "energy_saving"
        );
        AIExplanation explanation = explanationFuture.get();
        
        assertNotNull(explanation);
        assertTrue(explanation.getSuccess());
        assertEquals(TEST_DECISION_ID, explanation.getDecisionId());
        assertNotNull(explanation.getUserFriendlyExplanation());
        assertNotNull(explanation.getKeyFactors());
        
        // Validate safety
        CompletableFuture<AISafetyReport> safetyFuture = aiTransparencyService.validateSafety(
            TEST_DECISION_ID, "AUTOMATION_RECOMMENDATION", 
            recommendationRequest, recommendationResult, "energy_optimization"
        );
        AISafetyReport safetyReport = safetyFuture.get();
        
        assertNotNull(safetyReport);
        assertTrue(safetyReport.getSuccess());
        assertEquals(TEST_DECISION_ID, safetyReport.getDecisionId());
        assertNotNull(safetyReport.getSafetyLevel());
        assertNotNull(safetyReport.getSafetyChecks());
        
        log.info("Transparency and safety validation completed successfully");
        
        log.info("=== Complete AI Workflow Integration Test PASSED ===");
    }

    @Test
    void testMultiServiceDataFlow_CrossServiceIntegration() throws ExecutionException, InterruptedException {
        log.info("=== Starting Multi-Service Data Flow Test ===");
        
        // **Step 1: Pattern Analysis with Time Series Data**
        CompletableFuture<PatternAnalysisResult> patternFuture = patternAnalysisService.analyzeDevicePatterns(
            TEST_DEVICE_ID, List.of("24h", "7d", "30d")
        );
        PatternAnalysisResult patternResult = patternFuture.get();
        
        // **Step 2: Statistical Analysis based on Patterns**
        CompletableFuture<StatisticalAnalysisResult> statsFuture = timeSeriesAnalysisService.performStatisticalAnalysis(
            TEST_DEVICE_ID, List.of("24h", "7d", "30d")
        );
        StatisticalAnalysisResult statsResult = statsFuture.get();
        
        // **Step 3: Generate Recommendations with Statistical Context**
        RecommendationRequest request = RecommendationRequest.builder()
            .userId(TEST_USER_ID)
            .deviceIds(List.of(TEST_DEVICE_ID))
            .context("statistical_optimization")
            .userPreferences("data_driven")
            .build();
        
        CompletableFuture<RecommendationResponse> recommendationFuture = recommendationEngineService.generateRecommendations(request);
        RecommendationResponse recommendationResult = recommendationFuture.get();
        
        // **Step 4: Comprehensive Transparency Logging**
        CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
            "MULTI_SERVICE_ANALYSIS", TEST_USER_ID, TEST_DEVICE_ID,
            Map.of("patternResult", patternResult, "statsResult", statsResult, "recommendationResult", recommendationResult),
            0.94
        );
        AIActivityLog activityLog = activityFuture.get();
        
        // **Step 5: Cross-Service Audit Trail**
        CompletableFuture<AIDecisionAudit> auditFuture = aiTransparencyService.createDecisionAudit(
            "multi-service-decision", "CROSS_SERVICE_ANALYSIS",
            Map.of("patterns", patternResult, "statistics", statsResult),
            recommendationResult,
            "Multi-service analysis combining pattern recognition, statistical analysis, and AI recommendations",
            0.93
        );
        AIDecisionAudit audit = auditFuture.get();
        
        // **Step 6: Comprehensive Safety Validation**
        CompletableFuture<AISafetyReport> safetyFuture = aiTransparencyService.validateSafety(
            "multi-service-decision", "CROSS_SERVICE_ANALYSIS",
            Map.of("patterns", patternResult, "statistics", statsResult),
            recommendationResult,
            "multi_service_context"
        );
        AISafetyReport safetyReport = safetyFuture.get();
        
        // **Validation**
        assertNotNull(patternResult);
        assertTrue(patternResult.getSuccess());
        
        assertNotNull(statsResult);
        assertTrue(statsResult.getSuccess());
        
        assertNotNull(recommendationResult);
        assertTrue(recommendationResult.getSuccess());
        
        assertNotNull(activityLog);
        assertTrue(activityLog.getSuccess());
        assertEquals("MULTI_SERVICE_ANALYSIS", activityLog.getActivityType());
        
        assertNotNull(audit);
        assertTrue(audit.getSuccess());
        assertEquals("multi-service-decision", audit.getDecisionId());
        
        assertNotNull(safetyReport);
        assertTrue(safetyReport.getSuccess());
        assertEquals("multi-service-decision", safetyReport.getDecisionId());
        
        log.info("=== Multi-Service Data Flow Integration Test PASSED ===");
    }

    @Test
    void testPerformanceIntegration_P95Targets() throws ExecutionException, InterruptedException {
        log.info("=== Starting Performance Integration Test ===");
        
        long startTime = System.currentTimeMillis();
        
        // **Concurrent Service Execution**
        CompletableFuture<PatternAnalysisResult> patternFuture = patternAnalysisService.analyzeDevicePatterns(
            TEST_DEVICE_ID, List.of("1h", "24h")
        );
        
        CompletableFuture<TimeSeriesData> timeSeriesFuture = timeSeriesAnalysisService.analyzeTimeSeriesData(
            TEST_DEVICE_ID, LocalDateTime.now().minusHours(1), LocalDateTime.now(), "15m"
        );
        
        CompletableFuture<RecommendationResponse> recommendationFuture = recommendationEngineService.generateRecommendations(
            RecommendationRequest.builder()
                .userId(TEST_USER_ID)
                .deviceIds(List.of(TEST_DEVICE_ID))
                .context("performance_test")
                .userPreferences("fast_response")
                .build()
        );
        
        CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
            "PERFORMANCE_TEST", TEST_USER_ID, TEST_DEVICE_ID, Map.of("test", "data"), 0.90
        );
        
        // **Wait for all services to complete**
        PatternAnalysisResult patternResult = patternFuture.get();
        TimeSeriesData timeSeriesResult = timeSeriesFuture.get();
        RecommendationResponse recommendationResult = recommendationFuture.get();
        AIActivityLog activityLog = activityFuture.get();
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        // **Performance Validation**
        assertTrue(totalTime < 1000, "Total integration time should be under 1 second");
        
        assertNotNull(patternResult);
        assertTrue(patternResult.getSuccess());
        assertNotNull(patternResult.getProcessingTimeMs());
        assertTrue(patternResult.getProcessingTimeMs() < 100, "Pattern analysis should be under 100ms");
        
        assertNotNull(timeSeriesResult);
        assertTrue(timeSeriesResult.getSuccess());
        assertNotNull(timeSeriesResult.getProcessingTimeMs());
        assertTrue(timeSeriesResult.getProcessingTimeMs() < 100, "Time series analysis should be under 100ms");
        
        assertNotNull(recommendationResult);
        assertTrue(recommendationResult.getSuccess());
        assertNotNull(recommendationResult.getProcessingTimeMs());
        assertTrue(recommendationResult.getProcessingTimeMs() < 100, "Recommendation generation should be under 100ms");
        
        assertNotNull(activityLog);
        assertTrue(activityLog.getSuccess());
        assertNotNull(activityLog.getProcessingTimeMs());
        assertTrue(activityLog.getProcessingTimeMs() < 100, "Activity logging should be under 100ms");
        
        log.info("=== Performance Integration Test PASSED - Total Time: {}ms ===", totalTime);
    }

    @Test
    void testErrorHandlingIntegration_Resilience() throws ExecutionException, InterruptedException {
        log.info("=== Starting Error Handling Integration Test ===");
        
        // **Simulate Redis connectivity issues**
        redisTemplate.getConnectionFactory().getConnection().close();
        
        try {
            // **Test service resilience with Redis down**
            CompletableFuture<PatternAnalysisResult> patternFuture = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, List.of("1h", "24h")
            );
            PatternAnalysisResult patternResult = patternFuture.get();
            
            // Should still work with graceful degradation
            assertNotNull(patternResult);
            // May not be successful due to Redis issues, but should not crash
            
            CompletableFuture<TimeSeriesData> timeSeriesFuture = timeSeriesAnalysisService.analyzeTimeSeriesData(
                TEST_DEVICE_ID, LocalDateTime.now().minusHours(1), LocalDateTime.now(), "15m"
            );
            TimeSeriesData timeSeriesResult = timeSeriesFuture.get();
            
            assertNotNull(timeSeriesResult);
            // May not be successful due to Redis issues, but should not crash
            
            CompletableFuture<RecommendationResponse> recommendationFuture = recommendationEngineService.generateRecommendations(
                RecommendationRequest.builder()
                    .userId(TEST_USER_ID)
                    .deviceIds(List.of(TEST_DEVICE_ID))
                    .context("error_test")
                    .userPreferences("resilient")
                    .build()
            );
            RecommendationResponse recommendationResult = recommendationFuture.get();
            
            assertNotNull(recommendationResult);
            // May not be successful due to Redis issues, but should not crash
            
            CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
                "ERROR_TEST", TEST_USER_ID, TEST_DEVICE_ID, Map.of("test", "data"), 0.85
            );
            AIActivityLog activityLog = activityFuture.get();
            
            assertNotNull(activityLog);
            // May not be successful due to Redis issues, but should not crash
            
        } finally {
            // **Restore Redis connection**
            redisTemplate.getConnectionFactory().getConnection().ping();
        }
        
        log.info("=== Error Handling Integration Test PASSED ===");
    }

    @Test
    void testDataConsistencyIntegration_CrossServiceValidation() throws ExecutionException, InterruptedException {
        log.info("=== Starting Data Consistency Integration Test ===");
        
        // **Generate consistent test data across services**
        String testDeviceId = "consistency-test-device";
        String testUserId = "consistency-test-user";
        
        // **Step 1: Pattern Analysis**
        CompletableFuture<PatternAnalysisResult> patternFuture = patternAnalysisService.analyzeDevicePatterns(
            testDeviceId, List.of("24h", "7d")
        );
        PatternAnalysisResult patternResult = patternFuture.get();
        
        // **Step 2: Time Series Analysis with same device**
        CompletableFuture<TimeSeriesData> timeSeriesFuture = timeSeriesAnalysisService.analyzeTimeSeriesData(
            testDeviceId, LocalDateTime.now().minusDays(1), LocalDateTime.now(), "1h"
        );
        TimeSeriesData timeSeriesResult = timeSeriesFuture.get();
        
        // **Step 3: Recommendation with consistent context**
        RecommendationRequest request = RecommendationRequest.builder()
            .userId(testUserId)
            .deviceIds(List.of(testDeviceId))
            .context("consistency_test")
            .userPreferences("consistent_data")
            .build();
        
        CompletableFuture<RecommendationResponse> recommendationFuture = recommendationEngineService.generateRecommendations(request);
        RecommendationResponse recommendationResult = recommendationFuture.get();
        
        // **Step 4: Transparency logging with consistent identifiers**
        CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
            "CONSISTENCY_TEST", testUserId, testDeviceId, 
            Map.of("patternResult", patternResult, "timeSeriesResult", timeSeriesResult, "recommendationResult", recommendationResult),
            0.95
        );
        AIActivityLog activityLog = activityFuture.get();
        
        // **Step 5: Audit trail with consistent data**
        CompletableFuture<AIDecisionAudit> auditFuture = aiTransparencyService.createDecisionAudit(
            "consistency-decision", "CONSISTENCY_TEST",
            Map.of("deviceId", testDeviceId, "userId", testUserId, "patternResult", patternResult),
            Map.of("recommendationResult", recommendationResult, "timeSeriesResult", timeSeriesResult),
            "Consistent data flow across all services",
            0.94
        );
        AIDecisionAudit audit = auditFuture.get();
        
        // **Data Consistency Validation**
        assertNotNull(patternResult);
        assertTrue(patternResult.getSuccess());
        
        assertNotNull(timeSeriesResult);
        assertTrue(timeSeriesResult.getSuccess());
        
        assertNotNull(recommendationResult);
        assertTrue(recommendationResult.getSuccess());
        
        assertNotNull(activityLog);
        assertTrue(activityLog.getSuccess());
        assertEquals(testUserId, activityLog.getUserId());
        assertEquals(testDeviceId, activityLog.getDeviceId());
        
        assertNotNull(audit);
        assertTrue(audit.getSuccess());
        assertEquals(testUserId, audit.getUserId());
        assertEquals(testDeviceId, audit.getDeviceId());
        
        // **Verify data consistency across services**
        assertTrue(activityLog.getTimestamp().isAfter(LocalDateTime.now().minusMinutes(1)));
        assertTrue(audit.getTimestamp().isAfter(LocalDateTime.now().minusMinutes(1)));
        
        log.info("=== Data Consistency Integration Test PASSED ===");
    }

    @Test
    void testScalabilityIntegration_ConcurrentRequests() throws ExecutionException, InterruptedException {
        log.info("=== Starting Scalability Integration Test ===");
        
        // **Simulate concurrent requests**
        int concurrentRequests = 5;
        CompletableFuture<PatternAnalysisResult>[] patternFutures = new CompletableFuture[concurrentRequests];
        CompletableFuture<TimeSeriesData>[] timeSeriesFutures = new CompletableFuture[concurrentRequests];
        CompletableFuture<RecommendationResponse>[] recommendationFutures = new CompletableFuture[concurrentRequests];
        CompletableFuture<AIActivityLog>[] activityFutures = new CompletableFuture[concurrentRequests];
        
        // **Start concurrent requests**
        for (int i = 0; i < concurrentRequests; i++) {
            String deviceId = "concurrent-device-" + i;
            String userId = "concurrent-user-" + i;
            
            patternFutures[i] = patternAnalysisService.analyzeDevicePatterns(
                deviceId, List.of("1h", "24h")
            );
            
            timeSeriesFutures[i] = timeSeriesAnalysisService.analyzeTimeSeriesData(
                deviceId, LocalDateTime.now().minusHours(1), LocalDateTime.now(), "15m"
            );
            
            recommendationFutures[i] = recommendationEngineService.generateRecommendations(
                RecommendationRequest.builder()
                    .userId(userId)
                    .deviceIds(List.of(deviceId))
                    .context("concurrent_test")
                    .userPreferences("scalable")
                    .build()
            );
            
            activityFutures[i] = aiTransparencyService.logAIActivity(
                "CONCURRENT_TEST", userId, deviceId, Map.of("test", "data"), 0.90
            );
        }
        
        // **Wait for all concurrent requests to complete**
        long startTime = System.currentTimeMillis();
        
        PatternAnalysisResult[] patternResults = new PatternAnalysisResult[concurrentRequests];
        TimeSeriesData[] timeSeriesResults = new TimeSeriesData[concurrentRequests];
        RecommendationResponse[] recommendationResults = new RecommendationResponse[concurrentRequests];
        AIActivityLog[] activityLogs = new AIActivityLog[concurrentRequests];
        
        for (int i = 0; i < concurrentRequests; i++) {
            patternResults[i] = patternFutures[i].get();
            timeSeriesResults[i] = timeSeriesFutures[i].get();
            recommendationResults[i] = recommendationFutures[i].get();
            activityLogs[i] = activityFutures[i].get();
        }
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        // **Scalability Validation**
        assertTrue(totalTime < 5000, "Concurrent requests should complete within 5 seconds");
        
        for (int i = 0; i < concurrentRequests; i++) {
            assertNotNull(patternResults[i]);
            assertTrue(patternResults[i].getSuccess());
            
            assertNotNull(timeSeriesResults[i]);
            assertTrue(timeSeriesResults[i].getSuccess());
            
            assertNotNull(recommendationResults[i]);
            assertTrue(recommendationResults[i].getSuccess());
            
            assertNotNull(activityLogs[i]);
            assertTrue(activityLogs[i].getSuccess());
        }
        
        log.info("=== Scalability Integration Test PASSED - {} concurrent requests completed in {}ms ===", 
            concurrentRequests, totalTime);
    }

    @Test
    void testHealthMonitoringIntegration_ServiceStatus() throws ExecutionException, InterruptedException {
        log.info("=== Starting Health Monitoring Integration Test ===");
        
        // **Test health status of all services**
        String patternHealth = patternAnalysisService.getHealthStatus();
        CompletableFuture<String> timeSeriesHealthFuture = timeSeriesAnalysisService.getHealthStatus();
        CompletableFuture<String> recommendationHealthFuture = recommendationEngineService.getHealthStatus();
        CompletableFuture<String> transparencyHealthFuture = aiTransparencyService.getHealthStatus();
        
        String timeSeriesHealth = timeSeriesHealthFuture.get();
        String recommendationHealth = recommendationHealthFuture.get();
        String transparencyHealth = transparencyHealthFuture.get();
        
        // **Health Status Validation**
        assertNotNull(patternHealth);
        assertTrue(patternHealth.contains("HEALTHY") || patternHealth.contains("DEGRADED"));
        
        assertNotNull(timeSeriesHealth);
        assertTrue(timeSeriesHealth.contains("HEALTHY") || timeSeriesHealth.contains("DEGRADED"));
        
        assertNotNull(recommendationHealth);
        assertTrue(recommendationHealth.contains("HEALTHY") || recommendationHealth.contains("DEGRADED"));
        
        assertNotNull(transparencyHealth);
        assertTrue(transparencyHealth.contains("HEALTHY") || transparencyHealth.contains("DEGRADED"));
        
        log.info("Pattern Analysis Health: {}", patternHealth);
        log.info("Time Series Analysis Health: {}", timeSeriesHealth);
        log.info("Recommendation Engine Health: {}", recommendationHealth);
        log.info("Transparency Service Health: {}", transparencyHealth);
        
        log.info("=== Health Monitoring Integration Test PASSED ===");
    }
} 