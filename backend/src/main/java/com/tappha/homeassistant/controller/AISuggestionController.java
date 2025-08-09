package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.service.AIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Controller for AI suggestion endpoints
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/v1/ai-suggestions")
@Slf4j
@ConditionalOnBean(AIService.class)
public class AISuggestionController {

    private final AIService aiService;
    private final HomeAssistantEventRepository eventRepository;

    public AISuggestionController(AIService aiService, HomeAssistantEventRepository eventRepository) {
        this.aiService = aiService;
        this.eventRepository = eventRepository;
    }

    /**
     * Generate context-aware AI suggestion with 90% accuracy target
     */
    @PostMapping("/generate-context-aware")
    public CompletableFuture<ResponseEntity<AISuggestion>> generateContextAwareSuggestion(
            @RequestParam UUID connectionId,
            @RequestParam(required = false) String userContext,
            @RequestParam(defaultValue = "100") int eventLimit,
            @RequestBody(required = false) UserPreferences preferences) {
        
        try {
            log.info("Generating context-aware AI suggestion for connection: {}", connectionId);
            
            // Use default preferences if none provided
            if (preferences == null) {
                preferences = UserPreferences.builder()
                        .safetyLevel("balanced")
                        .preferredModel("gpt-4o-mini")
                        .automationComplexity("moderate")
                        .confidenceThreshold(0.9)
                        .safetyThreshold(0.8)
                        .enableLearning(true)
                        .enableNotifications(true)
                        .build();
            }
            
            // Generate context-aware suggestion
            CompletableFuture<AISuggestion> suggestionFuture = 
                aiService.generateContextAwareSuggestion(connectionId, userContext, preferences, eventLimit);
            
            return suggestionFuture.thenApply(suggestion -> {
                log.info("Generated context-aware suggestion with confidence: {}", suggestion.getConfidence());
                return ResponseEntity.ok(suggestion);
            });
            
        } catch (Exception e) {
            log.error("Failed to generate context-aware AI suggestion for connection: {}", connectionId, e);
            return CompletableFuture.completedFuture(ResponseEntity.internalServerError()
                    .body(AISuggestion.builder()
                            .suggestion("Failed to generate AI suggestion. Please try again.")
                            .confidence(0.0)
                            .reasoning("Error occurred during suggestion generation")
                            .build()));
        }
    }

    /**
     * Generate AI suggestion based on recent events (legacy method)
     */
    @PostMapping("/generate")
    public ResponseEntity<AISuggestion> generateSuggestion(
            @RequestParam UUID connectionId,
            @RequestParam(required = false) String userContext,
            @RequestParam(defaultValue = "100") int eventLimit) {
        
        try {
            log.info("Generating AI suggestion for connection: {}", connectionId);
            
            // Get recent events for the connection
            List<HomeAssistantEvent> events = eventRepository
                    .findRecentEventsByConnectionId(connectionId, eventLimit);
            
            if (events.isEmpty()) {
                log.warn("No events found for connection: {}", connectionId);
                return ResponseEntity.ok(AISuggestion.builder()
                        .suggestion("No recent events available for analysis. Please ensure your Home Assistant connection is active and events are being recorded.")
                        .confidence(0.0)
                        .context("No events available")
                        .timestamp(System.currentTimeMillis())
                        .build());
            }
            
            // Generate AI suggestion using legacy method
            AISuggestion suggestion = aiService.generateSuggestion(events, userContext);
            
            log.info("Generated AI suggestion with confidence: {}", suggestion.getConfidence());
            return ResponseEntity.ok(suggestion);
            
        } catch (Exception e) {
            log.error("Failed to generate AI suggestion for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError()
                    .body(AISuggestion.builder()
                            .suggestion("Failed to generate AI suggestion. Please try again.")
                            .confidence(0.0)
                            .reasoning("Error occurred during suggestion generation")
                            .build());
        }
    }

    /**
     * Get suggestion by ID
     */
    @GetMapping("/{suggestionId}")
    public ResponseEntity<AISuggestion> getSuggestion(@PathVariable String suggestionId) {
        try {
            log.info("Getting suggestion by ID: {}", suggestionId);
            
            // TODO: Implement actual database retrieval
            // For now, return a mock suggestion
            AISuggestion suggestion = AISuggestion.builder()
                    .id(suggestionId)
                    .suggestion("Sample automation suggestion")
                    .confidence(0.85)
                    .safetyScore(0.9)
                    .reasoning("Based on detected usage patterns")
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            return ResponseEntity.ok(suggestion);
            
        } catch (Exception e) {
            log.error("Failed to get suggestion by ID: {}", suggestionId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Approve suggestion
     */
    @PostMapping("/{suggestionId}/approve")
    public ResponseEntity<AISuggestion> approveSuggestion(@PathVariable String suggestionId) {
        try {
            log.info("Approving suggestion: {}", suggestionId);
            
            // TODO: Implement actual approval logic
            // For now, return the suggestion with approved status
            AISuggestion suggestion = AISuggestion.builder()
                    .id(suggestionId)
                    .approvalStatus("approved")
                    .build();
            
            return ResponseEntity.ok(suggestion);
            
        } catch (Exception e) {
            log.error("Failed to approve suggestion: {}", suggestionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reject suggestion
     */
    @PostMapping("/{suggestionId}/reject")
    public ResponseEntity<AISuggestion> rejectSuggestion(@PathVariable String suggestionId) {
        try {
            log.info("Rejecting suggestion: {}", suggestionId);
            
            // TODO: Implement actual rejection logic
            // For now, return the suggestion with rejected status
            AISuggestion suggestion = AISuggestion.builder()
                    .id(suggestionId)
                    .approvalStatus("rejected")
                    .build();
            
            return ResponseEntity.ok(suggestion);
            
        } catch (Exception e) {
            log.error("Failed to reject suggestion: {}", suggestionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 