package com.tappha.ai.service;

import com.tappha.ai.dto.AutomationSuggestion;
import com.tappha.ai.dto.PatternAnalysisResult;
import com.tappha.ai.dto.BehavioralModelResult;
import com.tappha.ai.dto.AIRecommendationRequest;
import com.tappha.ai.dto.AIRecommendationResponse;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * AI Service Interface for Phase 2: Intelligence Engine
 * 
 * This service orchestrates all AI/ML capabilities including:
 * - Pattern recognition and analysis
 * - Behavioral modeling
 * - Automation suggestions
 * - Real-time AI processing
 * 
 * Following Agent OS Standards with privacy-first approach
 */
public interface AIService {

    /**
     * Generate automation suggestions based on behavioral analysis
     * 
     * @param request The AI recommendation request with context
     * @return AI recommendation response with suggestions and confidence scores
     */
    CompletableFuture<AIRecommendationResponse> generateAutomationSuggestions(AIRecommendationRequest request);

    /**
     * Perform advanced pattern analysis across multiple time intervals
     * 
     * @param deviceId The device ID to analyze
     * @param timeIntervals List of time intervals (1 day, 1 week, 1 month, 6 months, 1 year)
     * @return Pattern analysis results with confidence scores
     */
    CompletableFuture<PatternAnalysisResult> analyzePatterns(String deviceId, List<String> timeIntervals);

    /**
     * Model household behavioral patterns and routines
     * 
     * @param householdId The household ID to model
     * @return Behavioral model results with identified routines
     */
    CompletableFuture<BehavioralModelResult> modelBehavioralPatterns(String householdId);

    /**
     * Generate context-aware automation suggestions
     * 
     * @param context The current context and user preferences
     * @return List of automation suggestions with explanations
     */
    CompletableFuture<List<AutomationSuggestion>> generateContextAwareSuggestions(String context);

    /**
     * Validate AI suggestions against user safety preferences
     * 
     * @param suggestion The automation suggestion to validate
     * @param userPreferences The user's control preferences
     * @return Validation result with safety score
     */
    CompletableFuture<Boolean> validateSuggestionSafety(AutomationSuggestion suggestion, String userPreferences);

    /**
     * Process real-time events for immediate AI insights
     * 
     * @param eventData The real-time event data
     * @return Immediate AI insights and recommendations
     */
    CompletableFuture<AIRecommendationResponse> processRealTimeEvent(String eventData);

    /**
     * Get AI transparency information for user dashboard
     * 
     * @param userId The user ID requesting transparency data
     * @return Transparency information with AI decision explanations
     */
    CompletableFuture<String> getTransparencyInfo(String userId);

    /**
     * Emergency stop for AI features
     * 
     * @param userId The user ID requesting the stop
     * @return Success status of the emergency stop
     */
    CompletableFuture<Boolean> emergencyStop(String userId);

    /**
     * Get AI service health and performance metrics
     * 
     * @return Health status with performance metrics
     */
    CompletableFuture<String> getHealthStatus();
} 