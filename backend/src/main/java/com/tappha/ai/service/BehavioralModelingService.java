package com.tappha.ai.service;

import com.tappha.ai.dto.BehavioralModelResult;

import java.util.concurrent.CompletableFuture;

/**
 * Behavioral Modeling Service Interface for Phase 2: Intelligence Engine
 * 
 * Handles AI models for household behavioral analysis:
 * - Household routines and preferences identification
 * - User segmentation (23% early adopters, 45% cautious, 25% skeptical, 7% resistant)
 * - Device usage pattern analysis
 * - Energy consumption patterns
 * - Security and safety patterns
 * 
 * Following Agent OS Standards with privacy-preserving methods
 */
public interface BehavioralModelingService {

    /**
     * Model household behavioral patterns and routines
     * 
     * @param householdId The household ID to model
     * @return Behavioral model results with identified routines
     */
    CompletableFuture<BehavioralModelResult> modelHouseholdBehavior(String householdId);

    /**
     * Model individual user behavior patterns
     * 
     * @param userId The user ID to model
     * @return Behavioral model results for the user
     */
    CompletableFuture<BehavioralModelResult> modelUserBehavior(String userId);

    /**
     * Identify household routines and preferences
     * 
     * @param householdId The household ID to analyze
     * @return Behavioral model results with routines
     */
    CompletableFuture<BehavioralModelResult> identifyRoutines(String householdId);

    /**
     * Analyze energy consumption patterns
     * 
     * @param householdId The household ID to analyze
     * @return Behavioral model results with energy patterns
     */
    CompletableFuture<BehavioralModelResult> analyzeEnergyPatterns(String householdId);

    /**
     * Analyze security and safety patterns
     * 
     * @param householdId The household ID to analyze
     * @return Behavioral model results with security patterns
     */
    CompletableFuture<BehavioralModelResult> analyzeSecurityPatterns(String householdId);

    /**
     * Get behavioral modeling service health status
     * 
     * @return Health status information
     */
    String getHealthStatus();
} 