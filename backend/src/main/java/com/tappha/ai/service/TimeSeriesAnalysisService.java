package com.tappha.ai.service;

import com.tappha.ai.dto.TimeSeriesData;
import com.tappha.ai.dto.StatisticalAnalysisResult;
import com.tappha.ai.dto.FrequencyAnalysisResult;
import com.tappha.ai.dto.CorrelationAnalysisResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Time Series Analysis Service for Phase 2.2: Advanced Analytics
 * 
 * Provides comprehensive time-series analysis capabilities including:
 * - Multi-dimensional time aggregations with InfluxDB Flux queries
 * - Statistical analysis using Apache Commons Math
 * - Frequency analysis with Fast Fourier Transform (FFT)
 * - Correlation analysis with Pearson correlation
 * - Time clustering with K-means clustering
 * - Seasonality detection algorithms
 * 
 * Following Agent OS Standards with P95 < 100ms response time
 */
public interface TimeSeriesAnalysisService {

    /**
     * Analyze time-series data for a specific device and time range
     * 
     * @param deviceId The device identifier
     * @param startTime Start of analysis period
     * @param endTime End of analysis period
     * @param granularity Time granularity (e.g., "15m", "1h", "1d")
     * @return CompletableFuture containing time-series analysis results
     */
    CompletableFuture<TimeSeriesData> analyzeTimeSeriesData(
        String deviceId, 
        LocalDateTime startTime, 
        LocalDateTime endTime, 
        String granularity
    );

    /**
     * Perform statistical analysis on time-series data
     * 
     * @param deviceId The device identifier
     * @param timeIntervals List of time intervals to analyze
     * @return CompletableFuture containing statistical analysis results
     */
    CompletableFuture<StatisticalAnalysisResult> performStatisticalAnalysis(
        String deviceId, 
        List<String> timeIntervals
    );

    /**
     * Perform frequency analysis using Fast Fourier Transform (FFT)
     * 
     * @param deviceId The device identifier
     * @param timeRange Time range for frequency analysis
     * @return CompletableFuture containing frequency analysis results
     */
    CompletableFuture<FrequencyAnalysisResult> performFrequencyAnalysis(
        String deviceId, 
        String timeRange
    );

    /**
     * Perform correlation analysis between multiple devices
     * 
     * @param deviceIds List of device identifiers to correlate
     * @param timeRange Time range for correlation analysis
     * @return CompletableFuture containing correlation analysis results
     */
    CompletableFuture<CorrelationAnalysisResult> performCorrelationAnalysis(
        List<String> deviceIds, 
        String timeRange
    );

    /**
     * Detect seasonality patterns in time-series data
     * 
     * @param deviceId The device identifier
     * @param timeRange Time range for seasonality detection
     * @return CompletableFuture containing seasonality detection results
     */
    CompletableFuture<StatisticalAnalysisResult> detectSeasonality(
        String deviceId, 
        String timeRange
    );

    /**
     * Perform time clustering analysis using K-means clustering
     * 
     * @param deviceId The device identifier
     * @param timeRange Time range for clustering analysis
     * @param numClusters Number of clusters to identify
     * @return CompletableFuture containing clustering analysis results
     */
    CompletableFuture<StatisticalAnalysisResult> performTimeClustering(
        String deviceId, 
        String timeRange, 
        int numClusters
    );

    /**
     * Get health status of the time-series analysis service
     * 
     * @return CompletableFuture containing health status information
     */
    CompletableFuture<String> getHealthStatus();
} 