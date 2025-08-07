package com.tappha.ai.service;

import com.tappha.ai.dto.*;
import com.tappha.ai.service.impl.TimeSeriesAnalysisServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Time Series Analysis Service Tests for Phase 2.2: Advanced Analytics
 * 
 * Comprehensive test coverage for:
 * - Time-series data analysis
 * - Statistical analysis with Apache Commons Math
 * - Frequency analysis with Fast Fourier Transform (FFT)
 * - Correlation analysis with Pearson correlation
 * - Seasonality detection
 * - Time clustering
 * - Redis caching functionality
 * - Async processing with CompletableFuture
 * - Error handling and resilience
 * 
 * Following Agent OS Standards with 85%+ test coverage requirement
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TimeSeriesAnalysisServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private TimeSeriesAnalysisServiceImpl timeSeriesAnalysisService;

    private static final String TEST_DEVICE_ID = "test_device_001";
    private static final String TEST_HOUSEHOLD_ID = "test_household_001";
    private static final List<String> TEST_DEVICE_IDS = List.of("device_001", "device_002", "device_003");
    private static final List<String> TEST_TIME_INTERVALS = List.of("1_day", "1_week", "1_month");
    private static final LocalDateTime TEST_START_TIME = LocalDateTime.now().minusDays(7);
    private static final LocalDateTime TEST_END_TIME = LocalDateTime.now();
    private static final String TEST_GRANULARITY = "1h";
    private static final String TEST_TIME_RANGE = "7d";

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), any(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void testAnalyzeTimeSeriesData_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<TimeSeriesData> future = timeSeriesAnalysisService.analyzeTimeSeriesData(
                TEST_DEVICE_ID, TEST_START_TIME, TEST_END_TIME, TEST_GRANULARITY);

        // Then
        assertNotNull(future);
        TimeSeriesData result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertEquals(TEST_START_TIME, result.getStartTime());
        assertEquals(TEST_END_TIME, result.getEndTime());
        assertEquals(TEST_GRANULARITY, result.getGranularity());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertTrue(result.getProcessingTimeMs() > 0);
        assertNotNull(result.getDataPoints());
        assertNotNull(result.getAggregatedMetrics());
        assertEquals("InfluxDB", result.getDataSource());
        assertEquals("Phase2.2_TimeSeries", result.getProcessingModel());
        assertTrue(result.getTotalDataPoints() > 0);
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("timeseries:" + TEST_DEVICE_ID),
                eq(result),
                eq(60 * 60L), // 1 hour TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testPerformStatisticalAnalysis_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.performStatisticalAnalysis(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);

        // Then
        assertNotNull(future);
        StatisticalAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertNotNull(result.getMean());
        assertNotNull(result.getMedian());
        assertNotNull(result.getStandardDeviation());
        assertNotNull(result.getVariance());
        assertNotNull(result.getMinValue());
        assertNotNull(result.getMaxValue());
        assertNotNull(result.getRange());
        assertNotNull(result.getMovingAverages());
        assertNotNull(result.getSeasonalityInfo());
        assertNotNull(result.getTimeClusters());
        assertEquals("STATISTICAL_ANALYSIS", result.getAnalysisType());
        assertEquals("Apache_Commons_Math", result.getModelUsed());
        assertTrue(result.getProcessingTimeMs() > 0);
        assertEquals(0.88, result.getConfidenceScore(), 0.01);
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("statistical:" + TEST_DEVICE_ID),
                eq(result),
                eq(24 * 60 * 60L), // 24 hours TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testPerformFrequencyAnalysis_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<FrequencyAnalysisResult> future = timeSeriesAnalysisService.performFrequencyAnalysis(
                TEST_DEVICE_ID, TEST_TIME_RANGE);

        // Then
        assertNotNull(future);
        FrequencyAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertNotNull(result.getFrequencyComponents());
        assertNotNull(result.getDominantFrequencies());
        assertNotNull(result.getPeriodicPatterns());
        assertEquals("FREQUENCY_ANALYSIS", result.getAnalysisType());
        assertEquals("Fast_Fourier_Transform", result.getModelUsed());
        assertTrue(result.getProcessingTimeMs() > 0);
        assertEquals(0.85, result.getConfidenceScore(), 0.01);
        assertEquals(256, result.getFftSize());
        assertEquals(1.0, result.getSamplingRate(), 0.01);
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("frequency:" + TEST_DEVICE_ID),
                eq(result),
                eq(12 * 60 * 60L), // 12 hours TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testPerformCorrelationAnalysis_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<CorrelationAnalysisResult> future = timeSeriesAnalysisService.performCorrelationAnalysis(
                TEST_DEVICE_IDS, TEST_TIME_RANGE);

        // Then
        assertNotNull(future);
        CorrelationAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_IDS, result.getDeviceIds());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertNotNull(result.getCorrelationMatrix());
        assertNotNull(result.getStrongCorrelations());
        assertNotNull(result.getWeakCorrelations());
        assertNotNull(result.getCorrelationPatterns());
        assertEquals("CORRELATION_ANALYSIS", result.getAnalysisType());
        assertEquals("Pearson_Correlation", result.getModelUsed());
        assertTrue(result.getProcessingTimeMs() > 0);
        assertEquals(0.87, result.getConfidenceScore(), 0.01);
        assertEquals(TEST_TIME_RANGE, result.getTimeRange());
        assertEquals(TEST_DEVICE_IDS.size(), result.getTotalDevices());
        
        // Verify Redis caching
        verify(valueOperations).set(
                contains("correlation:" + TEST_DEVICE_IDS.hashCode()),
                eq(result),
                eq(6 * 60 * 60L), // 6 hours TTL
                eq(TimeUnit.SECONDS)
        );
    }

    @Test
    void testDetectSeasonality_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.detectSeasonality(
                TEST_DEVICE_ID, TEST_TIME_RANGE);

        // Then
        assertNotNull(future);
        StatisticalAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertNotNull(result.getSeasonalityInfo());
        assertEquals("SEASONALITY_DETECTION", result.getAnalysisType());
        assertEquals("Statistical_Analysis", result.getModelUsed());
        assertEquals(150L, result.getProcessingTimeMs());
        assertEquals(0.86, result.getConfidenceScore(), 0.01);
        
        // Verify seasonality info
        StatisticalAnalysisResult.SeasonalityInfo seasonalityInfo = result.getSeasonalityInfo();
        assertNotNull(seasonalityInfo);
        assertNotNull(seasonalityInfo.getSeasonalityType());
        assertNotNull(seasonalityInfo.getSeasonalityStrength());
        assertNotNull(seasonalityInfo.getSeasonalityPeriod());
    }

    @Test
    void testPerformTimeClustering_Success() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");
        int numClusters = 3;

        // When
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.performTimeClustering(
                TEST_DEVICE_ID, TEST_TIME_RANGE, numClusters);

        // Then
        assertNotNull(future);
        StatisticalAnalysisResult result = future.get();
        
        assertNotNull(result);
        assertEquals(TEST_DEVICE_ID, result.getDeviceId());
        assertTrue(result.getSuccess());
        assertNotNull(result.getAnalyzedAt());
        assertNotNull(result.getTimeClusters());
        assertEquals("TIME_CLUSTERING", result.getAnalysisType());
        assertEquals("K_Means_Clustering", result.getModelUsed());
        assertEquals(120L, result.getProcessingTimeMs());
        assertEquals(0.84, result.getConfidenceScore(), 0.01);
        
        // Verify clustering results
        List<StatisticalAnalysisResult.TimeCluster> clusters = result.getTimeClusters();
        assertNotNull(clusters);
        assertEquals(numClusters, clusters.size());
        
        for (StatisticalAnalysisResult.TimeCluster cluster : clusters) {
            assertNotNull(cluster.getClusterId());
            assertNotNull(cluster.getClusterLabel());
            assertNotNull(cluster.getCentroidValue());
            assertNotNull(cluster.getClusterPoints());
            assertNotNull(cluster.getClusterSize());
            assertNotNull(cluster.getClusterDensity());
        }
    }

    @Test
    void testGetHealthStatus_Healthy() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<String> future = timeSeriesAnalysisService.getHealthStatus();

        // Then
        assertNotNull(future);
        String healthStatus = future.get();
        
        assertNotNull(healthStatus);
        assertTrue(healthStatus.contains("HEALTHY"));
        assertTrue(healthStatus.contains("Apache Commons Math integration"));
    }

    @Test
    void testGetHealthStatus_Unhealthy() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Redis connection failed"));

        // When
        CompletableFuture<String> future = timeSeriesAnalysisService.getHealthStatus();

        // Then
        assertNotNull(future);
        String healthStatus = future.get();
        
        assertNotNull(healthStatus);
        assertTrue(healthStatus.contains("UNHEALTHY"));
        assertTrue(healthStatus.contains("Redis connection failed"));
    }

    @Test
    void testAnalyzeTimeSeriesData_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<TimeSeriesData> future = timeSeriesAnalysisService.analyzeTimeSeriesData(
                TEST_DEVICE_ID, TEST_START_TIME, TEST_END_TIME, TEST_GRANULARITY);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testPerformStatisticalAnalysis_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.performStatisticalAnalysis(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testPerformFrequencyAnalysis_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<FrequencyAnalysisResult> future = timeSeriesAnalysisService.performFrequencyAnalysis(
                TEST_DEVICE_ID, TEST_TIME_RANGE);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testPerformCorrelationAnalysis_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<CorrelationAnalysisResult> future = timeSeriesAnalysisService.performCorrelationAnalysis(
                TEST_DEVICE_IDS, TEST_TIME_RANGE);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testDetectSeasonality_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.detectSeasonality(
                TEST_DEVICE_ID, TEST_TIME_RANGE);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testPerformTimeClustering_ErrorHandling() {
        // Given
        when(valueOperations.get("health_check")).thenThrow(new RuntimeException("Test error"));

        // When & Then
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.performTimeClustering(
                TEST_DEVICE_ID, TEST_TIME_RANGE, 3);

        assertNotNull(future);
        assertThrows(ExecutionException.class, () -> future.get());
    }

    @Test
    void testConcurrentProcessing() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When - Multiple concurrent requests
        CompletableFuture<TimeSeriesData> future1 = timeSeriesAnalysisService.analyzeTimeSeriesData(
                TEST_DEVICE_ID, TEST_START_TIME, TEST_END_TIME, TEST_GRANULARITY);
        CompletableFuture<StatisticalAnalysisResult> future2 = timeSeriesAnalysisService.performStatisticalAnalysis(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);
        CompletableFuture<FrequencyAnalysisResult> future3 = timeSeriesAnalysisService.performFrequencyAnalysis(
                TEST_DEVICE_ID, TEST_TIME_RANGE);

        // Then - All should complete successfully
        TimeSeriesData result1 = future1.get();
        StatisticalAnalysisResult result2 = future2.get();
        FrequencyAnalysisResult result3 = future3.get();

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
        CompletableFuture<TimeSeriesData> future = timeSeriesAnalysisService.analyzeTimeSeriesData(
                TEST_DEVICE_ID, TEST_START_TIME, TEST_END_TIME, TEST_GRANULARITY);
        TimeSeriesData result = future.get();
        long endTime = System.currentTimeMillis();

        // Then
        long processingTime = endTime - startTime;
        assertTrue(processingTime < 2000, "Processing time should be under 2 seconds");
        assertTrue(result.getProcessingTimeMs() > 0, "Processing time should be recorded");
        assertTrue(result.getProcessingTimeMs() < 2000, "Processing time should be reasonable");
    }

    @Test
    void testStatisticalAnalysisMetrics() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<StatisticalAnalysisResult> future = timeSeriesAnalysisService.performStatisticalAnalysis(
                TEST_DEVICE_ID, TEST_TIME_INTERVALS);
        StatisticalAnalysisResult result = future.get();

        // Then
        assertNotNull(result.getMean());
        assertNotNull(result.getMedian());
        assertNotNull(result.getStandardDeviation());
        assertNotNull(result.getVariance());
        assertNotNull(result.getMinValue());
        assertNotNull(result.getMaxValue());
        assertNotNull(result.getRange());
        
        // Verify statistical relationships
        assertTrue(result.getMaxValue() >= result.getMinValue());
        assertTrue(result.getMean() >= result.getMinValue());
        assertTrue(result.getMean() <= result.getMaxValue());
        assertTrue(result.getStandardDeviation() >= 0);
        assertTrue(result.getVariance() >= 0);
    }

    @Test
    void testFrequencyAnalysisMetrics() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<FrequencyAnalysisResult> future = timeSeriesAnalysisService.performFrequencyAnalysis(
                TEST_DEVICE_ID, TEST_TIME_RANGE);
        FrequencyAnalysisResult result = future.get();

        // Then
        assertNotNull(result.getFrequencyComponents());
        assertNotNull(result.getDominantFrequencies());
        assertNotNull(result.getPeriodicPatterns());
        
        // Verify frequency analysis results
        assertTrue(result.getFrequencyComponents().size() > 0);
        assertTrue(result.getDominantFrequencies().size() <= 5); // Top 5 dominant frequencies
        assertTrue(result.getFftSize() > 0);
        assertTrue(result.getSamplingRate() > 0);
    }

    @Test
    void testCorrelationAnalysisMetrics() throws ExecutionException, InterruptedException {
        // Given
        when(valueOperations.get("health_check")).thenReturn("OK");

        // When
        CompletableFuture<CorrelationAnalysisResult> future = timeSeriesAnalysisService.performCorrelationAnalysis(
                TEST_DEVICE_IDS, TEST_TIME_RANGE);
        CorrelationAnalysisResult result = future.get();

        // Then
        assertNotNull(result.getCorrelationMatrix());
        assertNotNull(result.getStrongCorrelations());
        assertNotNull(result.getWeakCorrelations());
        assertNotNull(result.getCorrelationPatterns());
        
        // Verify correlation matrix structure
        assertEquals(TEST_DEVICE_IDS.size(), result.getCorrelationMatrix().size());
        for (String deviceId : TEST_DEVICE_IDS) {
            assertTrue(result.getCorrelationMatrix().containsKey(deviceId));
            assertEquals(TEST_DEVICE_IDS.size(), result.getCorrelationMatrix().get(deviceId).size());
        }
        
        // Verify correlation values are between -1 and 1
        for (Map<String, Double> correlations : result.getCorrelationMatrix().values()) {
            for (Double correlation : correlations.values()) {
                assertTrue(correlation >= -1.0 && correlation <= 1.0);
            }
        }
    }
} 