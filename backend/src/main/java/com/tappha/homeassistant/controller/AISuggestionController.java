package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.service.AIService;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;

import java.util.List;
import java.util.UUID;
import java.util.Map;

/**
 * AI Suggestion Controller
 * 
 * Handles AI suggestion requests and responses for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/v1/ai-suggestions")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnBean(AIService.class)
public class AISuggestionController {

    private final AIService aiService;
    private final HomeAssistantEventRepository eventRepository;

    /**
     * Generate AI suggestion based on recent events
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
            
            // Generate AI suggestion
            AISuggestion suggestion = aiService.generateSuggestion(events, userContext);
            
            // Validate suggestion
            if (!aiService.validateSuggestion(suggestion)) {
                log.warn("AI suggestion validation failed for connection: {}", connectionId);
                return ResponseEntity.ok(AISuggestion.builder()
                        .suggestion("Unable to generate safe suggestion at this time. Please try again later.")
                        .confidence(0.0)
                        .context("Validation failed")
                        .timestamp(System.currentTimeMillis())
                        .build());
            }
            
            log.info("Successfully generated AI suggestion for connection: {}", connectionId);
            return ResponseEntity.ok(suggestion);
            
        } catch (Exception e) {
            log.error("Error generating AI suggestion for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError()
                    .body(AISuggestion.builder()
                            .suggestion("An error occurred while generating suggestions. Please try again later.")
                            .confidence(0.0)
                            .context("Error occurred")
                            .timestamp(System.currentTimeMillis())
                            .build());
        }
    }

    /**
     * Validate an AI suggestion
     */
    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateSuggestion(@RequestBody AISuggestion suggestion) {
        try {
            boolean isValid = aiService.validateSuggestion(suggestion);
            log.info("AI suggestion validation result: {}", isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Error validating AI suggestion", e);
            return ResponseEntity.internalServerError().body(false);
        }
    }

    /**
     * Store event embedding for future similarity search
     */
    @PostMapping("/store-embedding")
    public ResponseEntity<Void> storeEventEmbedding(@RequestParam UUID eventId) {
        try {
            HomeAssistantEvent event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
            
            aiService.storeEventEmbedding(event);
            log.info("Stored event embedding for event: {}", eventId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error storing event embedding for event: {}", eventId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Approve an AI suggestion
     */
    @PostMapping("/{suggestionId}/approve")
    public ResponseEntity<Map<String, Object>> approveSuggestion(
            @PathVariable UUID suggestionId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Approved by user");
            String userEmail = request.getOrDefault("userEmail", "unknown@example.com");
            
            log.info("Approving suggestion: {} by user: {}", suggestionId, userEmail);
            
            // TODO: Implement approval logic with AISuggestionApproval entity
            // This would involve creating an AISuggestionApproval record
            // and updating the AISuggestion status
            
            return ResponseEntity.ok(Map.of(
                    "status", "approved",
                    "suggestionId", suggestionId.toString(),
                    "approvedBy", userEmail,
                    "reason", reason,
                    "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            log.error("Error approving suggestion: {}", suggestionId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to approve suggestion",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    /**
     * Reject an AI suggestion
     */
    @PostMapping("/{suggestionId}/reject")
    public ResponseEntity<Map<String, Object>> rejectSuggestion(
            @PathVariable UUID suggestionId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Rejected by user");
            String userEmail = request.getOrDefault("userEmail", "unknown@example.com");
            
            log.info("Rejecting suggestion: {} by user: {}", suggestionId, userEmail);
            
            // TODO: Implement rejection logic with AISuggestionApproval entity
            // This would involve creating an AISuggestionApproval record
            // and updating the AISuggestion status
            
            return ResponseEntity.ok(Map.of(
                    "status", "rejected",
                    "suggestionId", suggestionId.toString(),
                    "rejectedBy", userEmail,
                    "reason", reason,
                    "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            log.error("Error rejecting suggestion: {}", suggestionId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to reject suggestion",
                            "timestamp", System.currentTimeMillis()
                    ));
        }
    }

    /**
     * Get AI service health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        try {
            return ResponseEntity.ok(Map.of(
                    "status", "healthy",
                    "timestamp", System.currentTimeMillis(),
                    "service", "AI Suggestion Engine"
            ));
        } catch (Exception e) {
            log.error("Error checking AI service health", e);
            return ResponseEntity.ok(Map.of(
                    "status", "unhealthy",
                    "timestamp", System.currentTimeMillis(),
                    "error", e.getMessage()
            ));
        }
    }
} 