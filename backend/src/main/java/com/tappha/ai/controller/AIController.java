package com.tappha.ai.controller;

import com.tappha.ai.service.AIService;
import com.tappha.ai.dto.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * AI Controller for Phase 2: Intelligence Engine
 * 
 * REST API endpoints for AI/ML capabilities:
 * - Automation suggestion generation
 * - Pattern analysis
 * - Behavioral modeling
 * - Real-time AI processing
 * - Transparency and safety controls
 * 
 * Following Agent OS Standards with comprehensive API design
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    /**
     * Generate automation suggestions
     */
    @PostMapping("/suggestions")
    public CompletableFuture<ResponseEntity<AIRecommendationResponse>> generateSuggestions(
            @RequestBody AIRecommendationRequest request) {
        log.info("Received automation suggestion request for user: {}", request.getUserId());
        
        return aiService.generateAutomationSuggestions(request)
            .thenApply(response -> {
                if (response.getSuccess()) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.badRequest().body(response);
                }
            });
    }

    /**
     * Analyze patterns for a device
     */
    @GetMapping("/patterns/device/{deviceId}")
    public CompletableFuture<ResponseEntity<PatternAnalysisResult>> analyzeDevicePatterns(
            @PathVariable String deviceId,
            @RequestParam List<String> timeIntervals) {
        log.info("Received pattern analysis request for device: {}", deviceId);
        
        return aiService.analyzePatterns(deviceId, timeIntervals)
            .thenApply(response -> {
                if (response.getSuccess()) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.badRequest().body(response);
                }
            });
    }

    /**
     * Model behavioral patterns for a household
     */
    @GetMapping("/behavior/household/{householdId}")
    public CompletableFuture<ResponseEntity<BehavioralModelResult>> modelHouseholdBehavior(
            @PathVariable String householdId) {
        log.info("Received behavioral modeling request for household: {}", householdId);
        
        return aiService.modelBehavioralPatterns(householdId)
            .thenApply(response -> {
                if (response.getSuccess()) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.badRequest().body(response);
                }
            });
    }

    /**
     * Generate context-aware suggestions
     */
    @PostMapping("/suggestions/context")
    public CompletableFuture<ResponseEntity<List<AutomationSuggestion>>> generateContextAwareSuggestions(
            @RequestBody String context) {
        log.info("Received context-aware suggestion request");
        
        return aiService.generateContextAwareSuggestions(context)
            .thenApply(suggestions -> ResponseEntity.ok(suggestions));
    }

    /**
     * Validate suggestion safety
     */
    @PostMapping("/safety/validate")
    public CompletableFuture<ResponseEntity<Boolean>> validateSuggestionSafety(
            @RequestBody AutomationSuggestion suggestion,
            @RequestParam String userPreferences) {
        log.info("Received safety validation request for suggestion: {}", suggestion.getSuggestionId());
        
        return aiService.validateSuggestionSafety(suggestion, userPreferences)
            .thenApply(isSafe -> ResponseEntity.ok(isSafe));
    }

    /**
     * Process real-time events
     */
    @PostMapping("/events/realtime")
    public CompletableFuture<ResponseEntity<AIRecommendationResponse>> processRealTimeEvent(
            @RequestBody String eventData) {
        log.info("Received real-time event processing request");
        
        return aiService.processRealTimeEvent(eventData)
            .thenApply(response -> {
                if (response.getSuccess()) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.badRequest().body(response);
                }
            });
    }

    /**
     * Get AI transparency information
     */
    @GetMapping("/transparency/{userId}")
    public CompletableFuture<ResponseEntity<String>> getTransparencyInfo(
            @PathVariable String userId) {
        log.info("Received transparency info request for user: {}", userId);
        
        return aiService.getTransparencyInfo(userId)
            .thenApply(info -> ResponseEntity.ok(info));
    }

    /**
     * Emergency stop for AI features
     */
    @PostMapping("/emergency-stop/{userId}")
    public CompletableFuture<ResponseEntity<Boolean>> emergencyStop(
            @PathVariable String userId) {
        log.info("Received emergency stop request for user: {}", userId);
        
        return aiService.emergencyStop(userId)
            .thenApply(success -> ResponseEntity.ok(success));
    }

    /**
     * Get AI service health status
     */
    @GetMapping("/health")
    public CompletableFuture<ResponseEntity<String>> getHealthStatus() {
        log.info("Received AI service health check request");
        
        return aiService.getHealthStatus()
            .thenApply(status -> ResponseEntity.ok(status));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("AI Service is running");
    }
} 