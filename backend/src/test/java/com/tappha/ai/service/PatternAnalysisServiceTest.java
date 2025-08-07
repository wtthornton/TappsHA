package com.tappha.ai.service;

import com.tappha.ai.dto.PatternAnalysisResult;
import com.tappha.ai.service.impl.PatternAnalysisServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pattern Analysis Service Tests for Phase 2: Intelligence Engine
 * 
 * Comprehensive test coverage for:
 * - Device pattern analysis
 * - Household pattern analysis  
 * - Anomaly detection
 * - Predictive analytics
 * - Redis caching functionality
 * - Async processing with CompletableFuture
 * - Error handling and resilience
 * 
 * Following Agent OS Standards with 85%+ test coverage requirement
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class PatternAnalysisServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private PatternAnalysisServiceImpl patternAnalysisService;

    private static final String TEST_DEVICE_ID = "test_device_001";
    private static final String TEST_HOUSEHOLD_ID = "test_household_001";
    private static final List<String> TEST_TIME_INTERVALS = List.of("1_day", "1_week", "1_month");

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), any(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void testAnalyzeDevicePatterns_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);

        // Then
        assertNotNull(future);
        PatternAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertEquals(0.85, result.getOverallConfidence(), 0.01);
        assertTrue(result.getSuccess());
        assertEquals("LOCAL_ONLY", result.getPrivacyLevel());
        assertEquals("Phase2.1_Placeholder", result.getModelUsed());
        assertNotNull(result.getAnalyzedAt());
        assertTrue(result.getProcessingTimeMs() > 0);
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("device_pattern:" + TEST_DEVICE_ID),
                eq(result),
                eq(24 * 60 * 60L),
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testAnalyzeHouseholdPatterns_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.analyzeHouseholdPatterns(
                TEST_HOUSEHOLD_ID, TEST_TIME_INTERVALS);

        // Then
        assertNotNull(future);
        PatternAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_HOUSEHOLD_ID, result.getDeviceId()); // Using deviceId field for household
        assertEquals(0.87, result.getOverallConfidence(), 0.01);
        assertTrue(result.getSuccess());
        assertEquals("LOCAL_ONLY", result.getPrivacyLevel());
        assertEquals("Phase2.1_Placeholder", result.getModelUsed());
        assertNotNull(result.getAnalyzedAt());
        assertTrue(result.getProcessingTimeMs() > 0);
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("household_pattern:" + TEST_HOUSEHOLD_ID),
                eq(result),
                eq(24 * 60 * 60L),
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testDetectAnomalies_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.detectAnomalies(TEST_DEVICE_ID);

        // Then
        assertNotNull(future);
        PatternAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertEquals(0.88, result.getOverallConfidence(), 0.01);
        assertTrue(result.getSuccess());
        assertEquals("LOCAL_ONLY", result.getPrivacyLevel());
        assertEquals("Phase2.1_Placeholder", result.getModelUsed());
        assertNotNull(result.getAnalyzedAt());
        assertTrue(result.getProcessingTimeMs() > 0);
        
        // Verify Redis caching with shorter TTL for anomalies
        verify(valueOperations).set(
                contains("anomaly:" + TEST_DEVICE_ID),
                eq(result),
                eq(60 * 60L), // 1 hour TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testGeneratePredictions_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.generatePredictions(TEST_DEVICE_ID);

        // Then
        assertNotNull(future);
        PatternAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertEquals(0.86, result.getOverallConfidence(), 0.01);
        assertTrue(result.getSuccess());
        assertEquals("LOCAL_ONLY", result.getPrivacyLevel());
        assertEquals("Phase2.1_Placeholder", result.getModelUsed());
        assertNotNull(result.getAnalyzedAt());
        assertTrue(result.getProcessingTimeMs() > 0);
        
        // Verify Redis caching with short TTL for predictions
        verify(valueOperations).set(
                contains("prediction:" + TEST_DEVICE_ID),
                eq(result),
                eq(30 * 60L), // 30 minutes TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testGetHealthStatus_Healthy() {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        String healthStatus = patternAnalysisService.getHealthStatus();

        // Then
        assertNotNull(healthStatus);
        assertTrue(healthStatus.contains("HEALTHY"));
        assertTrue(healthStatus.contains("Redis caching enabled"));
    }

    @Test
    void testGetHealthStatus_Unhealthy() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Redis connection failed"));

        // When
        String healthStatus = patternAnalysisService.getHealthStatus();

        // Then
        assertNotNull(healthStatus);
        assertTrue(healthStatus.contains("UNHEALTHY"));
        assertTrue(healthStatus.contains("Redis connection failed"));
    }

    @Test
    void testAnalyzeDevicePatterns_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testAnalyzeHouseholdPatterns_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.analyzeHouseholdPatterns(
                TEST_HOUSEHOLD_ID, TEST_TIME_INTERVALS);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testDetectAnomalies_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.detectAnomalies(TEST_DEVICE_ID);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testGeneratePredictions_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.generatePredictions(TEST_DEVICE_ID);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testClearDeviceCache_Success() {
        // Given
        doReturn(1L).when(redisTemplate).delete(anyString());

        // When
        patternAnalysisService.clearDeviceCache(TEST_DEVICE_ID);

        // Then
        verify(redisTemplate, times(3)).delete(anyString());
    }

    @Test
    void testClearDeviceCache_ErrorHandling() {
        // Given
        when(redisTemplate.delete(anyString())).thenThrow(new RuntimeException("Cache clear failed"));

        // When & Then - Should not throw exception
        assertDoesNotThrow(() -> patternAnalysisService.clearDeviceCache(TEST_DEVICE_ID));
    }

    @Test
    void testClearHouseholdCache_Success() {
        // Given
        doReturn(1L).when(redisTemplate).delete(anyString());

        // When
        patternAnalysisService.clearHouseholdCache(TEST_HOUSEHOLD_ID);

        // Then
        verify(redisTemplate).delete(anyString());
    }

    @Test
    void testClearHouseholdCache_ErrorHandling() {
        // Given
        when(redisTemplate.delete(anyString())).thenThrow(new RuntimeException("Cache clear failed"));

        // When & Then - Should not throw exception
        assertDoesNotThrow(() -> patternAnalysisService.clearHouseholdCache(TEST_HOUSEHOLD_ID));
    }

    @Test
    void testConcurrentProcessing() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When - Multiple concurrent requests
        CompletableFuture<PatternAnalysisResult> future1 = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);
        CompletableFuture<PatternAnalysisResult> future2 = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);
        CompletableFuture<PatternAnalysisResult> future3 = patternAnalysisService.detectAnomalies(TEST_DEVICE_ID);

        // Then - All should complete successfully
        PatternAnalysisResult result1 = future1.get();
        PatternAnalysisResult result2 = future2.get();
        PatternAnalysisResult result3 = future3.get();

        assertNotNull(result1);
        assertNotNull(result2);
        assertNotNull(result3);
        assertTrue(result1.getSuccess());
        assertTrue(result2.getSuccess());
        assertTrue(result3.getSuccess());
    }

    @Test
    void testPerformanceMetrics() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        long startTime = System.currentTimeMillis();
        CompletableFuture<PatternAnalysisResult> future = patternAnalysisService.analyzeDevicePatterns(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);
        PatternAnalysisResult result = future.get();
        long endTime = System.currentTimeMillis();

        // Then
        long processingTime = endTime - startTime;
        assertTrue(processingTime < 1000, "Processing time should be under 1 second");
        assertTrue(result.getProcessingTimeMs() > 0, "Processing time should be recorded");
        assertTrue(result.getProcessingTimeMs() < 1000, "Processing time should be reasonable");
    }
} 