package com.tappha.ai.service;

import com.tappha.ai.dto.RecommendationRequest;
import com.tappha.ai.dto.RecommendationResponse;
import com.tappha.ai.dto.RecommendationFeedback;
import com.tappha.ai.dto.RecommendationAccuracy;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Recommendation Engine Service for Phase 2.3: AI Recommendation Engine
 * 
 * Provides context-aware automation suggestions with:
 * - LangChain 0.3 framework integration for AI application development
 * - Context-aware suggestion generation with 90% accuracy target
 * - Real-time recommendation generation and ranking
 * - User approval workflow integration
 * - Feedback collection and model improvement
 * - Recommendation explanation capabilities
 * 
 * Following Agent OS Standards with 90% accuracy target
 */
public interface RecommendationEngineService {

    /**
     * Generate context-aware automation suggestions
     * 
     * @param request The recommendation request with context and user preferences
     * @return CompletableFuture containing recommendation response
     */
    CompletableFuture<RecommendationResponse> generateRecommendations(RecommendationRequest request);

    /**
     * Rank recommendations based on user preferences and historical data
     * 
     * @param recommendations List of recommendations to rank
     * @param userPreferences User preference data
     * @return CompletableFuture containing ranked recommendations
     */
    CompletableFuture<List<RecommendationResponse.Recommendation>> rankRecommendations(
        List<RecommendationResponse.Recommendation> recommendations, 
        String userPreferences
    );

    /**
     * Generate explanation for a specific recommendation
     * 
     * @param recommendationId The recommendation ID to explain
     * @param userId The user ID requesting the explanation
     * @return CompletableFuture containing recommendation explanation
     */
    CompletableFuture<String> generateRecommendationExplanation(String recommendationId, String userId);

    /**
     * Collect and process user feedback for recommendations
     * 
     * @param feedback The feedback data from user
     * @return CompletableFuture containing feedback processing result
     */
    CompletableFuture<Boolean> processRecommendationFeedback(RecommendationFeedback feedback);

    /**
     * Validate recommendation accuracy and quality
     * 
     * @param recommendationId The recommendation ID to validate
     * @return CompletableFuture containing accuracy assessment
     */
    CompletableFuture<RecommendationAccuracy> validateRecommendationAccuracy(String recommendationId);

    /**
     * Get recommendation statistics and performance metrics
     * 
     * @param userId The user ID for statistics
     * @param timeRange The time range for statistics
     * @return CompletableFuture containing recommendation statistics
     */
    CompletableFuture<RecommendationResponse.RecommendationStats> getRecommendationStats(
        String userId, 
        String timeRange
    );

    /**
     * Update recommendation model based on feedback and performance
     * 
     * @param modelUpdateRequest The model update request
     * @return CompletableFuture containing model update result
     */
    CompletableFuture<Boolean> updateRecommendationModel(String modelUpdateRequest);

    /**
     * Get health status of the recommendation engine
     * 
     * @return CompletableFuture containing health status information
     */
    CompletableFuture<String> getHealthStatus();
} 