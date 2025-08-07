package com.tappha.ai.service;

import com.tappha.ai.dto.PatternAnalysisResult;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Pattern Analysis Service Interface for Phase 2: Intelligence Engine
 * 
 * Handles multi-dimensional pattern analysis across different time intervals:
 * - 1 day, 1 week, 1 month, 6 months, 1 year analysis
 * - Time-series algorithms with 85-90% accuracy
 * - Behavioral pattern identification
 * - Predictive analytics
 * 
 * Following Agent OS Standards with comprehensive analysis
 */
public interface PatternAnalysisService {

    /**
     * Analyze device patterns across multiple time intervals
     * 
     * @param deviceId The device ID to analyze
     * @param timeIntervals List of time intervals to analyze
     * @return Pattern analysis results with confidence scores
     */
    CompletableFuture<PatternAnalysisResult> analyzeDevicePatterns(String deviceId, List<String> timeIntervals);

    /**
     * Analyze household patterns across all devices
     * 
     * @param householdId The household ID to analyze
     * @param timeIntervals List of time intervals to analyze
     * @return Pattern analysis results for the household
     */
    CompletableFuture<PatternAnalysisResult> analyzeHouseholdPatterns(String householdId, List<String> timeIntervals);

    /**
     * Detect anomalies in device behavior
     * 
     * @param deviceId The device ID to check for anomalies
     * @return Anomaly detection results
     */
    CompletableFuture<PatternAnalysisResult> detectAnomalies(String deviceId);

    /**
     * Generate predictive insights for device usage
     * 
     * @param deviceId The device ID for predictions
     * @return Predictive analysis results
     */
    CompletableFuture<PatternAnalysisResult> generatePredictions(String deviceId);

    /**
     * Get pattern analysis service health status
     * 
     * @return Health status information
     */
    String getHealthStatus();
} 