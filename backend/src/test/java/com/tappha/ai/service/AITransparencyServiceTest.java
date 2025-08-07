package com.tappha.ai.service;

import com.tappha.ai.dto.AIActivityLog;
import com.tappha.ai.dto.AIDecisionAudit;
import com.tappha.ai.dto.AIExplanation;
import com.tappha.ai.dto.AISafetyReport;
import com.tappha.ai.dto.AITransparencyConfig;
import com.tappha.ai.service.impl.AITransparencyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Test Suite for AITransparencyService
 *
 * Tests all transparency and safety features including:
 * - Real-time AI activity monitoring and logging
 * - Detailed audit trails for all AI decisions
 * - Explainable AI with detailed reasoning
 * - Safety validation and approval workflows
 * - Privacy controls and data protection
 * - Comprehensive transparency reporting
 *
 * Following Agent OS Standards with 85%+ test coverage
 */
@ExtendWith(MockitoExtension.class)
class AITransparencyServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private AITransparencyServiceImpl aiTransparencyService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testLogAIActivity_Success() throws ExecutionException, InterruptedException {
        // Given
        String activityType = "RECOMMENDATION_GENERATED";
        String userId = "user123";
        String deviceId = "device456";
        Object activityData = Map.of("sample", "data");
        Double confidenceScore = 0.95;

        // When
        CompletableFuture<AIActivityLog> future = aiTransparencyService.logAIActivity(
            activityType, userId, deviceId, activityData, confidenceScore
        );
        AIActivityLog result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(activityType, result.getActivityType());
        assertEquals(userId, result.getUserId());
        assertEquals(deviceId, result.getDeviceId());
        assertEquals(confidenceScore, result.getConfidenceScore());
        assertTrue(result.getSuccess());
        assertNotNull(result.getLogId());
        assertNotNull(result.getTimestamp());
        assertNotNull(result.getSessionId());
        assertNotNull(result.getRequestId());
        assertNotNull(result.getProcessingTimeMs());
        assertEquals("127.0.0.1", result.getIpAddress());
        assertEquals("TappHA-AI-System/1.0", result.getUserAgent());
        assertEquals("production", result.getEnvironment());
        assertEquals("2.4.0", result.getVersion());

        // Verify Redis caching
        verify(valueOperations).set(anyString(), eq(result), any(java.time.Duration.class));
    }

    @Test
    void testLogAIActivity_Error() throws ExecutionException, InterruptedException {
        // Given
        doThrow(new RuntimeException("Redis error"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When
        CompletableFuture<AIActivityLog> future = aiTransparencyService.logAIActivity(
            "TEST_ACTIVITY", "user123", "device456", Map.of("test", "data"), 0.85
        );
        AIActivityLog result = future.get();

        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals("Redis error", result.getErrorMessage());
    }

    @Test
    void testCreateDecisionAudit_Success() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String decisionType = "AUTOMATION_RECOMMENDATION";
        Object inputData = Map.of("input", "data");
        Object outputData = Map.of("output", "data");
        String reasoning = "Sample reasoning";
        Double safetyScore = 0.92;

        // When
        CompletableFuture<AIDecisionAudit> future = aiTransparencyService.createDecisionAudit(
            decisionId, decisionType, inputData, outputData, reasoning, safetyScore
        );
        AIDecisionAudit result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(decisionId, result.getDecisionId());
        assertEquals(decisionType, result.getDecisionType());
        assertEquals(inputData, result.getInputData());
        assertEquals(outputData, result.getOutputData());
        assertEquals(reasoning, result.getReasoning());
        assertEquals(safetyScore, result.getSafetyScore());
        assertEquals("system", result.getUserId());
        assertEquals("ai-system", result.getDeviceId());
        assertEquals("2.4.0", result.getModelVersion());
        assertEquals("transparency-audit", result.getAlgorithmUsed());
        assertEquals(0.95, result.getConfidenceScore());
        assertEquals("PENDING", result.getApprovalStatus());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAuditId());
        assertNotNull(result.getTimestamp());
        assertNotNull(result.getProcessingTimeMs());

        // Verify Redis caching
        verify(valueOperations).set(anyString(), eq(result), any(java.time.Duration.class));
    }

    @Test
    void testCreateDecisionAudit_Error() throws ExecutionException, InterruptedException {
        // Given
        doThrow(new RuntimeException("Database error"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When
        CompletableFuture<AIDecisionAudit> future = aiTransparencyService.createDecisionAudit(
            "decision123", "TEST_TYPE", Map.of("input", "data"), Map.of("output", "data"), 
            "reasoning", 0.90
        );
        AIDecisionAudit result = future.get();

        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals("Database error", result.getErrorMessage());
    }

    @Test
    void testGenerateExplanation_Success() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String decisionType = "AUTOMATION_RECOMMENDATION";
        Object inputData = Map.of("input", "data");
        Object outputData = Map.of("output", "data");
        String userPreferences = "energy_saving";

        // When
        CompletableFuture<AIExplanation> future = aiTransparencyService.generateExplanation(
            decisionId, decisionType, inputData, outputData, userPreferences
        );
        AIExplanation result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(decisionId, result.getDecisionId());
        assertEquals(decisionType, result.getDecisionType());
        assertEquals("USER_FRIENDLY", result.getExplanationType());
        assertNotNull(result.getReasoning());
        assertNotNull(result.getUserFriendlyExplanation());
        assertNotNull(result.getKeyFactors());
        assertFalse(result.getKeyFactors().isEmpty());
        assertNotNull(result.getFactorWeights());
        assertFalse(result.getFactorWeights().isEmpty());
        assertNotNull(result.getConfidenceExplanation());
        assertNotNull(result.getUncertaintyExplanation());
        assertNotNull(result.getAlternativeDecisions());
        assertFalse(result.getAlternativeDecisions().isEmpty());
        assertNotNull(result.getContextData());
        assertEquals("system", result.getUserId());
        assertEquals("2.4.0", result.getModelVersion());
        assertEquals("explainable-ai", result.getAlgorithmUsed());
        assertEquals(0.95, result.getConfidenceScore());
        assertTrue(result.getSuccess());
        assertNotNull(result.getExplanationId());
        assertNotNull(result.getTimestamp());
        assertNotNull(result.getProcessingTimeMs());

        // Verify Redis caching
        verify(valueOperations).set(anyString(), eq(result), any(java.time.Duration.class));
    }

    @Test
    void testGenerateExplanation_Error() throws ExecutionException, InterruptedException {
        // Given
        doThrow(new RuntimeException("Explanation generation error"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When
        CompletableFuture<AIExplanation> future = aiTransparencyService.generateExplanation(
            "decision123", "TEST_TYPE", Map.of("input", "data"), Map.of("output", "data"), "preferences"
        );
        AIExplanation result = future.get();

        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals("Explanation generation error", result.getErrorMessage());
    }

    @Test
    void testValidateSafety_Success() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String decisionType = "AUTOMATION_RECOMMENDATION";
        Object inputData = Map.of("input", "data");
        Object outputData = Map.of("output", "data");
        String userContext = "energy_optimization";

        // When
        CompletableFuture<AISafetyReport> future = aiTransparencyService.validateSafety(
            decisionId, decisionType, inputData, outputData, userContext
        );
        AISafetyReport result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(decisionId, result.getDecisionId());
        assertEquals(decisionType, result.getDecisionType());
        assertEquals(0.92, result.getOverallSafetyScore());
        assertEquals("SAFE", result.getSafetyLevel());
        assertNotNull(result.getSafetyChecks());
        assertFalse(result.getSafetyChecks().isEmpty());
        assertNotNull(result.getSafetyScores());
        assertFalse(result.getSafetyScores().isEmpty());
        assertNotNull(result.getSafetyWarnings());
        assertNotNull(result.getSafetyRecommendations());
        assertFalse(result.getSafetyRecommendations().isEmpty());
        assertNotNull(result.getRiskAssessment());
        assertNotNull(result.getMitigationStrategies());
        assertTrue(result.getRequiresApproval());
        assertEquals("USER_APPROVAL_REQUIRED", result.getApprovalWorkflow());
        assertEquals("system", result.getUserId());
        assertEquals("ai-system", result.getDeviceId());
        assertEquals("2.4.0", result.getModelVersion());
        assertEquals("safety-validation", result.getAlgorithmUsed());
        assertEquals(0.92, result.getConfidenceScore());
        assertTrue(result.getSuccess());
        assertNotNull(result.getReportId());
        assertNotNull(result.getTimestamp());
        assertNotNull(result.getProcessingTimeMs());

        // Verify Redis caching
        verify(valueOperations).set(anyString(), eq(result), any(java.time.Duration.class));
    }

    @Test
    void testValidateSafety_Error() throws ExecutionException, InterruptedException {
        // Given
        doThrow(new RuntimeException("Safety validation error"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When
        CompletableFuture<AISafetyReport> future = aiTransparencyService.validateSafety(
            "decision123", "TEST_TYPE", Map.of("input", "data"), Map.of("output", "data"), "context"
        );
        AISafetyReport result = future.get();

        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals("Safety validation error", result.getErrorMessage());
    }

    @Test
    void testGetActivityLogs_Success() throws ExecutionException, InterruptedException {
        // Given
        String userId = "user123";
        String deviceId = "device456";
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();
        String activityType = "RECOMMENDATION_GENERATED";

        // When
        CompletableFuture<List<AIActivityLog>> future = aiTransparencyService.getActivityLogs(
            userId, deviceId, startTime, endTime, activityType
        );
        List<AIActivityLog> result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(5, result.size());
        
        for (int i = 0; i < result.size(); i++) {
            AIActivityLog log = result.get(i);
            assertNotNull(log);
            assertEquals(activityType, log.getActivityType());
            assertEquals(userId, log.getUserId());
            assertEquals(deviceId, log.getDeviceId());
            assertTrue(log.getSuccess());
            assertNotNull(log.getLogId());
            assertNotNull(log.getTimestamp());
            assertNotNull(log.getProcessingTimeMs());
            assertEquals(0.85 + (i * 0.02), log.getConfidenceScore());
        }
    }

    @Test
    void testGetDecisionAudits_Success() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String decisionType = "AUTOMATION_RECOMMENDATION";
        LocalDateTime startTime = LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = LocalDateTime.now();

        // When
        CompletableFuture<List<AIDecisionAudit>> future = aiTransparencyService.getDecisionAudits(
            decisionId, decisionType, startTime, endTime
        );
        List<AIDecisionAudit> result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        
        for (int i = 0; i < result.size(); i++) {
            AIDecisionAudit audit = result.get(i);
            assertNotNull(audit);
            assertEquals(decisionId, audit.getDecisionId());
            assertEquals(decisionType, audit.getDecisionType());
            assertTrue(audit.getSuccess());
            assertNotNull(audit.getAuditId());
            assertNotNull(audit.getTimestamp());
            assertNotNull(audit.getProcessingTimeMs());
            assertEquals(0.90 + (i * 0.02), audit.getSafetyScore());
        }
    }

    @Test
    void testGetExplanation_Cached() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String explanationType = "USER_FRIENDLY";
        AIExplanation cachedExplanation = AIExplanation.builder()
            .explanationId("cached-explanation")
            .decisionId(decisionId)
            .explanationType(explanationType)
            .success(true)
            .build();
        
        when(valueOperations.get(anyString())).thenReturn(cachedExplanation);

        // When
        CompletableFuture<AIExplanation> future = aiTransparencyService.getExplanation(
            decisionId, explanationType
        );
        AIExplanation result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(cachedExplanation, result);
        assertEquals("cached-explanation", result.getExplanationId());
        assertTrue(result.getSuccess());
    }

    @Test
    void testGetExplanation_NotCached() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String explanationType = "USER_FRIENDLY";
        
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        CompletableFuture<AIExplanation> future = aiTransparencyService.getExplanation(
            decisionId, explanationType
        );
        AIExplanation result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(decisionId, result.getDecisionId());
        assertEquals("USER_FRIENDLY", result.getExplanationType());
        assertTrue(result.getSuccess());
        assertNotNull(result.getExplanationId());
        assertNotNull(result.getTimestamp());
    }

    @Test
    void testGetSafetyReport_Cached() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String reportType = "COMPREHENSIVE";
        AISafetyReport cachedReport = AISafetyReport.builder()
            .reportId("cached-report")
            .decisionId(decisionId)
            .safetyLevel("SAFE")
            .success(true)
            .build();
        
        when(valueOperations.get(anyString())).thenReturn(cachedReport);

        // When
        CompletableFuture<AISafetyReport> future = aiTransparencyService.getSafetyReport(
            decisionId, reportType
        );
        AISafetyReport result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(cachedReport, result);
        assertEquals("cached-report", result.getReportId());
        assertEquals("SAFE", result.getSafetyLevel());
        assertTrue(result.getSuccess());
    }

    @Test
    void testGetSafetyReport_NotCached() throws ExecutionException, InterruptedException {
        // Given
        String decisionId = "decision123";
        String reportType = "COMPREHENSIVE";
        
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        CompletableFuture<AISafetyReport> future = aiTransparencyService.getSafetyReport(
            decisionId, reportType
        );
        AISafetyReport result = future.get();

        // Then
        assertNotNull(result);
        assertEquals(decisionId, result.getDecisionId());
        assertEquals("SAFE", result.getSafetyLevel());
        assertTrue(result.getSuccess());
        assertNotNull(result.getReportId());
        assertNotNull(result.getTimestamp());
    }

    @Test
    void testUpdateTransparencyConfig_Success() throws ExecutionException, InterruptedException {
        // Given
        AITransparencyConfig config = AITransparencyConfig.builder()
            .configId("test-config")
            .enableActivityLogging(true)
            .enableDecisionAuditing(true)
            .enableExplanations(true)
            .enableSafetyValidation(true)
            .enablePrivacyControls(true)
            .logRetentionDays(30)
            .auditRetentionDays(90)
            .minConfidenceThreshold(0.80)
            .minSafetyThreshold(0.85)
            .build();

        // When
        CompletableFuture<AITransparencyConfig> future = aiTransparencyService.updateTransparencyConfig(config);
        AITransparencyConfig result = future.get();

        // Then
        assertNotNull(result);
        assertEquals("test-config", result.getConfigId());
        assertTrue(result.getEnableActivityLogging());
        assertTrue(result.getEnableDecisionAuditing());
        assertTrue(result.getEnableExplanations());
        assertTrue(result.getEnableSafetyValidation());
        assertTrue(result.getEnablePrivacyControls());
        assertEquals(30, result.getLogRetentionDays());
        assertEquals(90, result.getAuditRetentionDays());
        assertEquals(0.80, result.getMinConfidenceThreshold());
        assertEquals(0.85, result.getMinSafetyThreshold());
        assertTrue(result.getSuccess());
        assertNotNull(result.getTimestamp());

        // Verify Redis caching
        verify(valueOperations).set(anyString(), eq(result), any(java.time.Duration.class));
    }

    @Test
    void testUpdateTransparencyConfig_Error() throws ExecutionException, InterruptedException {
        // Given
        AITransparencyConfig config = AITransparencyConfig.builder()
            .configId("test-config")
            .build();
        
        doThrow(new RuntimeException("Config update error"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When
        CompletableFuture<AITransparencyConfig> future = aiTransparencyService.updateTransparencyConfig(config);
        AITransparencyConfig result = future.get();

        // Then
        assertNotNull(result);
        assertFalse(result.getSuccess());
        assertNotNull(result.getErrorMessage());
        assertEquals("Config update error", result.getErrorMessage());
    }

    @Test
    void testGetTransparencyConfig_Success() throws ExecutionException, InterruptedException {
        // When
        CompletableFuture<AITransparencyConfig> future = aiTransparencyService.getTransparencyConfig();
        AITransparencyConfig result = future.get();

        // Then
        assertNotNull(result);
        assertEquals("default-config", result.getConfigId());
        assertTrue(result.getEnableActivityLogging());
        assertTrue(result.getEnableDecisionAuditing());
        assertTrue(result.getEnableExplanations());
        assertTrue(result.getEnableSafetyValidation());
        assertTrue(result.getEnablePrivacyControls());
        assertEquals(30, result.getLogRetentionDays());
        assertEquals(90, result.getAuditRetentionDays());
        assertEquals(0.80, result.getMinConfidenceThreshold());
        assertEquals(0.85, result.getMinSafetyThreshold());
        assertNotNull(result.getRequiredApprovalTypes());
        assertFalse(result.getRequiredApprovalTypes().isEmpty());
        assertNotNull(result.getPrivacySettings());
        assertFalse(result.getPrivacySettings().isEmpty());
        assertNotNull(result.getTransparencySettings());
        assertFalse(result.getTransparencySettings().isEmpty());
        assertEquals("USER_FRIENDLY", result.getDefaultExplanationType());
        assertEquals("SAFE", result.getDefaultSafetyLevel());
        assertTrue(result.getEnableRealTimeMonitoring());
        assertTrue(result.getEnableComplianceReporting());
        assertTrue(result.getSuccess());
        assertNotNull(result.getTimestamp());
        assertEquals("production", result.getEnvironment());
        assertEquals("2.4.0", result.getVersion());
    }

    @Test
    void testExportTransparencyData_Success() throws ExecutionException, InterruptedException {
        // Given
        String userId = "user123";
        LocalDateTime startTime = LocalDateTime.now().minusDays(30);
        LocalDateTime endTime = LocalDateTime.now();
        String format = "JSON";

        // When
        CompletableFuture<String> future = aiTransparencyService.exportTransparencyData(
            userId, startTime, endTime, format
        );
        String result = future.get();

        // Then
        assertNotNull(result);
        assertTrue(result.contains("Transparency Data Export"));
        assertTrue(result.contains(userId));
        assertTrue(result.contains(format));
        assertTrue(result.contains("COMPLETED"));
    }

    @Test
    void testGetTransparencyMetrics_Success() throws ExecutionException, InterruptedException {
        // Given
        String userId = "user123";
        String timeRange = "30_days";

        // When
        CompletableFuture<Object> future = aiTransparencyService.getTransparencyMetrics(userId, timeRange);
        Object result = future.get();

        // Then
        assertNotNull(result);
        assertTrue(result instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> metrics = (Map<String, Object>) result;
        
        assertEquals(1250, metrics.get("totalDecisions"));
        assertEquals(0.89, metrics.get("averageConfidence"));
        assertEquals(0.92, metrics.get("averageSafetyScore"));
        assertEquals(1180, metrics.get("explanationsGenerated"));
        assertEquals(1250, metrics.get("safetyReports"));
        assertEquals(1150, metrics.get("userApprovals"));
        assertEquals(15, metrics.get("rejectedDecisions"));
        assertEquals(0.98, metrics.get("complianceScore"));
        assertEquals(timeRange, metrics.get("timeRange"));
        assertEquals(userId, metrics.get("userId"));
        assertNotNull(metrics.get("generatedAt"));
    }

    @Test
    void testGetHealthStatus_Healthy() throws ExecutionException, InterruptedException {
        // Given
        doReturn(true).when(valueOperations).set(anyString(), anyString(), any(java.time.Duration.class));
        doReturn("ok").when(valueOperations).get(anyString());

        // When
        CompletableFuture<String> future = aiTransparencyService.getHealthStatus();
        String result = future.get();

        // Then
        assertNotNull(result);
        assertTrue(result.contains("HEALTHY"));
        assertTrue(result.contains("All transparency services operational"));
    }

    @Test
    void testGetHealthStatus_Degraded() throws ExecutionException, InterruptedException {
        // Given
        doReturn(true).when(valueOperations).set(anyString(), anyString(), any(java.time.Duration.class));
        doReturn(null).when(valueOperations).get(anyString());

        // When
        CompletableFuture<String> future = aiTransparencyService.getHealthStatus();
        String result = future.get();

        // Then
        assertNotNull(result);
        assertTrue(result.contains("DEGRADED"));
        assertTrue(result.contains("Redis connectivity issues"));
    }

    @Test
    void testGetHealthStatus_Unhealthy() throws ExecutionException, InterruptedException {
        // Given
        doThrow(new RuntimeException("Redis connection failed"))
            .when(valueOperations).set(anyString(), anyString(), any(java.time.Duration.class));

        // When
        CompletableFuture<String> future = aiTransparencyService.getHealthStatus();
        String result = future.get();

        // Then
        assertNotNull(result);
        assertTrue(result.contains("UNHEALTHY"));
        assertTrue(result.contains("Redis connection failed"));
    }

    @Test
    void testAsyncProcessing() throws ExecutionException, InterruptedException {
        // Given
        String activityType = "TEST_ACTIVITY";
        String userId = "user123";
        String deviceId = "device456";
        Object activityData = Map.of("test", "data");
        Double confidenceScore = 0.90;

        // When
        CompletableFuture<AIActivityLog> future = aiTransparencyService.logAIActivity(
            activityType, userId, deviceId, activityData, confidenceScore
        );
        
        // Then
        assertFalse(future.isDone()); // Should be async
        
        AIActivityLog result = future.get();
        assertNotNull(result);
        assertEquals(activityType, result.getActivityType());
        assertTrue(result.getSuccess());
    }

    @Test
    void testErrorHandling_Comprehensive() throws ExecutionException, InterruptedException {
        // Given - Simulate various error scenarios
        doThrow(new RuntimeException("Comprehensive error test"))
            .when(valueOperations).set(anyString(), any(), any(java.time.Duration.class));

        // When - Test multiple error scenarios
        CompletableFuture<AIActivityLog> activityFuture = aiTransparencyService.logAIActivity(
            "TEST", "user", "device", Map.of("test", "data"), 0.85
        );
        CompletableFuture<AIDecisionAudit> auditFuture = aiTransparencyService.createDecisionAudit(
            "decision", "type", Map.of("input", "data"), Map.of("output", "data"), "reasoning", 0.90
        );
        CompletableFuture<AIExplanation> explanationFuture = aiTransparencyService.generateExplanation(
            "decision", "type", Map.of("input", "data"), Map.of("output", "data"), "preferences"
        );
        CompletableFuture<AISafetyReport> safetyFuture = aiTransparencyService.validateSafety(
            "decision", "type", Map.of("input", "data"), Map.of("output", "data"), "context"
        );

        // Then - Verify all error scenarios are handled gracefully
        AIActivityLog activityResult = activityFuture.get();
        assertFalse(activityResult.getSuccess());
        assertNotNull(activityResult.getErrorMessage());

        AIDecisionAudit auditResult = auditFuture.get();
        assertFalse(auditResult.getSuccess());
        assertNotNull(auditResult.getErrorMessage());

        AIExplanation explanationResult = explanationFuture.get();
        assertFalse(explanationResult.getSuccess());
        assertNotNull(explanationResult.getErrorMessage());

        AISafetyReport safetyResult = safetyFuture.get();
        assertFalse(safetyResult.getSuccess());
        assertNotNull(safetyResult.getErrorMessage());
    }

    @Test
    void testPerformance_ProcessingTime() throws ExecutionException, InterruptedException {
        // Given
        String activityType = "PERFORMANCE_TEST";
        String userId = "user123";
        String deviceId = "device456";
        Object activityData = Map.of("performance", "test");
        Double confidenceScore = 0.95;

        // When
        long startTime = System.currentTimeMillis();
        CompletableFuture<AIActivityLog> future = aiTransparencyService.logAIActivity(
            activityType, userId, deviceId, activityData, confidenceScore
        );
        AIActivityLog result = future.get();
        long endTime = System.currentTimeMillis();

        // Then
        assertNotNull(result);
        assertTrue(result.getSuccess());
        assertNotNull(result.getProcessingTimeMs());
        
        // Performance should be reasonable (under 100ms for P95 target)
        long totalTime = endTime - startTime;
        assertTrue(totalTime < 1000, "Total processing time should be under 1 second");
        assertTrue(result.getProcessingTimeMs() < 100, "Service processing time should be under 100ms");
    }
} 