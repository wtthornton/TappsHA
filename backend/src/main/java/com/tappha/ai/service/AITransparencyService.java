package com.tappha.ai.service;

import com.tappha.ai.dto.AIActivityLog;
import com.tappha.ai.dto.AIDecisionAudit;
import com.tappha.ai.dto.AIExplanation;
import com.tappha.ai.dto.AISafetyReport;
import com.tappha.ai.dto.AITransparencyConfig;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * AI Transparency Service for Phase 2.4: Transparency & Safety
 *
 * Provides comprehensive transparency and safety features including:
 * - Real-time AI activity monitoring and logging
 * - Detailed audit trails for all AI decisions
 * - Explainable AI with detailed reasoning
 * - Safety validation and approval workflows
 * - Privacy controls and data protection
 * - Comprehensive transparency reporting
 *
 * Following Agent OS Standards with P95 < 100ms response time
 */
public interface AITransparencyService {

    /**
     * Log AI activity for comprehensive monitoring
     *
     * @param activityType Type of AI activity (e.g., "RECOMMENDATION_GENERATED", "PATTERN_ANALYSIS")
     * @param userId User identifier
     * @param deviceId Device identifier (if applicable)
     * @param activityData Detailed activity data
     * @param confidenceScore Confidence score of the AI decision
     * @return CompletableFuture containing activity log entry
     */
    CompletableFuture<AIActivityLog> logAIActivity(
        String activityType,
        String userId,
        String deviceId,
        Object activityData,
        Double confidenceScore
    );

    /**
     * Create detailed audit trail for AI decisions
     *
     * @param decisionId Unique decision identifier
     * @param decisionType Type of AI decision
     * @param inputData Input data used for decision
     * @param outputData Output data from decision
     * @param reasoning Detailed reasoning for the decision
     * @param safetyScore Safety validation score
     * @return CompletableFuture containing audit trail entry
     */
    CompletableFuture<AIDecisionAudit> createDecisionAudit(
        String decisionId,
        String decisionType,
        Object inputData,
        Object outputData,
        String reasoning,
        Double safetyScore
    );

    /**
     * Generate explainable AI reasoning for decisions
     *
     * @param decisionId Decision identifier
     * @param decisionType Type of decision
     * @param inputData Input data used
     * @param outputData Output data generated
     * @param userPreferences User preferences context
     * @return CompletableFuture containing AI explanation
     */
    CompletableFuture<AIExplanation> generateExplanation(
        String decisionId,
        String decisionType,
        Object inputData,
        Object outputData,
        String userPreferences
    );

    /**
     * Perform comprehensive safety validation
     *
     * @param decisionId Decision identifier
     * @param decisionType Type of decision
     * @param inputData Input data
     * @param outputData Output data
     * @param userContext User context and preferences
     * @return CompletableFuture containing safety report
     */
    CompletableFuture<AISafetyReport> validateSafety(
        String decisionId,
        String decisionType,
        Object inputData,
        Object outputData,
        String userContext
    );

    /**
     * Get AI activity logs for monitoring
     *
     * @param userId User identifier (optional)
     * @param deviceId Device identifier (optional)
     * @param startTime Start time for filtering
     * @param endTime End time for filtering
     * @param activityType Activity type filter (optional)
     * @return CompletableFuture containing activity logs
     */
    CompletableFuture<List<AIActivityLog>> getActivityLogs(
        String userId,
        String deviceId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String activityType
    );

    /**
     * Get decision audit trails
     *
     * @param decisionId Decision identifier (optional)
     * @param decisionType Decision type filter (optional)
     * @param startTime Start time for filtering
     * @param endTime End time for filtering
     * @return CompletableFuture containing audit trails
     */
    CompletableFuture<List<AIDecisionAudit>> getDecisionAudits(
        String decisionId,
        String decisionType,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    /**
     * Get AI explanations for decisions
     *
     * @param decisionId Decision identifier
     * @param explanationType Type of explanation requested
     * @return CompletableFuture containing AI explanation
     */
    CompletableFuture<AIExplanation> getExplanation(
        String decisionId,
        String explanationType
    );

    /**
     * Get safety reports for decisions
     *
     * @param decisionId Decision identifier
     * @param reportType Type of safety report
     * @return CompletableFuture containing safety report
     */
    CompletableFuture<AISafetyReport> getSafetyReport(
        String decisionId,
        String reportType
    );

    /**
     * Update transparency configuration
     *
     * @param config Transparency configuration settings
     * @return CompletableFuture containing updated configuration
     */
    CompletableFuture<AITransparencyConfig> updateTransparencyConfig(
        AITransparencyConfig config
    );

    /**
     * Get current transparency configuration
     *
     * @return CompletableFuture containing current configuration
     */
    CompletableFuture<AITransparencyConfig> getTransparencyConfig();

    /**
     * Export transparency data for compliance
     *
     * @param userId User identifier
     * @param startTime Start time for export
     * @param endTime End time for export
     * @param format Export format (JSON, CSV, PDF)
     * @return CompletableFuture containing exported data
     */
    CompletableFuture<String> exportTransparencyData(
        String userId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String format
    );

    /**
     * Get transparency dashboard metrics
     *
     * @param userId User identifier (optional)
     * @param timeRange Time range for metrics
     * @return CompletableFuture containing dashboard metrics
     */
    CompletableFuture<Object> getTransparencyMetrics(
        String userId,
        String timeRange
    );

    /**
     * Get health status of the transparency service
     *
     * @return CompletableFuture containing health status information
     */
    CompletableFuture<String> getHealthStatus();
} 