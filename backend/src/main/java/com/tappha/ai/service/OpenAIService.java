package com.tappha.ai.service;

import com.tappha.ai.dto.AutomationSuggestion;
import com.tappha.ai.dto.AIRecommendationRequest;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * OpenAI Service Interface for Phase 2: Intelligence Engine
 * 
 * Handles all OpenAI GPT-4o Mini integrations for:
 * - Natural language processing
 * - Automation suggestion generation
 * - Context-aware recommendations
 * - Real-time event processing
 * 
 * Following Agent OS Standards with privacy-first approach
 */
public interface OpenAIService {

    /**
     * Generate automation suggestions using OpenAI GPT-4o Mini
     * 
     * @param request The AI recommendation request
     * @return List of automation suggestions
     */
    List<AutomationSuggestion> generateSuggestions(AIRecommendationRequest request);

    /**
     * Generate context-aware automation suggestions
     * 
     * @param context The current context and environment
     * @return List of context-aware suggestions
     */
    CompletableFuture<List<AutomationSuggestion>> generateContextAwareSuggestions(String context);

    /**
     * Process real-time events for immediate AI insights
     * 
     * @param eventData The real-time event data
     * @return List of real-time suggestions
     */
    List<AutomationSuggestion> processRealTimeEvent(String eventData);

    /**
     * Get OpenAI service health status
     * 
     * @return Health status information
     */
    String getHealthStatus();
    
    /**
     * Generate automation based on context
     * 
     * @param context The context for automation generation
     * @return Generated automation suggestion
     */
    AutomationSuggestion generateAutomation(String context);
} 