package com.tappha.decision.controller;

import com.tappha.decision.dto.DecisionDTO;
import com.tappha.decision.dto.DecisionAnalyticsDTO;
import com.tappha.decision.dto.DecisionHistoryDTO;
import com.tappha.decision.entity.DecisionReason;
import com.tappha.decision.service.DecisionTrackingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Decision Tracking Controller
 *
 * Provides REST endpoints for decision tracking including:
 * - Decision logging and retrieval
 * - Decision history and analytics
 * - Decision search and filtering
 * - Decision pattern analysis
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/decisions")
@Slf4j
public class DecisionTrackingController {

    @Autowired
    private DecisionTrackingService decisionTrackingService;

    /**
     * Log a new decision
     *
     * @param decision The decision data
     * @return ResponseEntity with the logged decision
     */
    @PostMapping("/log")
    public ResponseEntity<DecisionDTO> logDecision(@RequestBody DecisionDTO decision) {
        try {
            log.info("Logging decision: {} for user: {}", decision.getDecisionType(), decision.getUserId());
            DecisionDTO loggedDecision = decisionTrackingService.logDecision(decision);
            return ResponseEntity.ok(loggedDecision);
        } catch (Exception e) {
            log.error("Error logging decision", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision history for a user
     *
     * @param userId The user ID
     * @param limit The maximum number of decisions to return (default: 50)
     * @return ResponseEntity with decision history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<DecisionHistoryDTO>> getDecisionHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            log.info("Retrieving decision history for user: {} with limit: {}", userId, limit);
            List<DecisionHistoryDTO> history = decisionTrackingService.getDecisionHistory(userId, limit);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error retrieving decision history for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision analytics for a user
     *
     * @param userId The user ID
     * @param timeRange The time range for analytics (e.g., "7d", "30d", "90d")
     * @return ResponseEntity with decision analytics
     */
    @GetMapping("/analytics/{userId}")
    public ResponseEntity<DecisionAnalyticsDTO> getDecisionAnalytics(
            @PathVariable String userId,
            @RequestParam(defaultValue = "30d") String timeRange) {
        try {
            log.info("Generating decision analytics for user: {} - timeRange: {}", userId, timeRange);
            DecisionAnalyticsDTO analytics = decisionTrackingService.getDecisionAnalytics(userId, timeRange);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error generating decision analytics for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Search decisions with filters
     *
     * @param userId The user ID
     * @param filters The search filters
     * @return ResponseEntity with matching decisions
     */
    @PostMapping("/search/{userId}")
    public ResponseEntity<List<DecisionDTO>> searchDecisions(
            @PathVariable String userId,
            @RequestBody Map<String, Object> filters) {
        try {
            log.info("Searching decisions for user: {} with filters: {}", userId, filters);
            List<DecisionDTO> decisions = decisionTrackingService.searchDecisions(userId, filters);
            return ResponseEntity.ok(decisions);
        } catch (Exception e) {
            log.error("Error searching decisions for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision by ID
     *
     * @param decisionId The decision ID
     * @return ResponseEntity with the decision
     */
    @GetMapping("/{decisionId}")
    public ResponseEntity<DecisionDTO> getDecisionById(@PathVariable String decisionId) {
        try {
            log.info("Retrieving decision: {}", decisionId);
            Optional<DecisionDTO> decision = decisionTrackingService.getDecisionById(decisionId);
            return decision.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving decision: {}", decisionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision reasoning
     *
     * @param decisionId The decision ID
     * @return ResponseEntity with the decision reasoning
     */
    @GetMapping("/{decisionId}/reasoning")
    public ResponseEntity<DecisionReason> getDecisionReasoning(@PathVariable String decisionId) {
        try {
            log.info("Retrieving decision reasoning: {}", decisionId);
            Optional<DecisionReason> reasoning = decisionTrackingService.getDecisionReasoning(decisionId);
            return reasoning.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving decision reasoning: {}", decisionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision patterns for a user
     *
     * @param userId The user ID
     * @return ResponseEntity with decision patterns
     */
    @GetMapping("/patterns/{userId}")
    public ResponseEntity<Map<String, Object>> getDecisionPatterns(@PathVariable String userId) {
        try {
            log.info("Analyzing decision patterns for user: {}", userId);
            Map<String, Object> patterns = decisionTrackingService.getDecisionPatterns(userId);
            return ResponseEntity.ok(patterns);
        } catch (Exception e) {
            log.error("Error analyzing decision patterns for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export decision data for audit
     *
     * @param userId The user ID
     * @param startDate The start date
     * @param endDate The end date
     * @return ResponseEntity with decision data for export
     */
    @GetMapping("/export/{userId}")
    public ResponseEntity<List<DecisionDTO>> exportDecisionData(
            @PathVariable String userId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            log.info("Exporting decision data for user: {} from {} to {}", userId, startDate, endDate);
            List<DecisionDTO> decisions = decisionTrackingService.exportDecisionData(userId, startDate, endDate);
            return ResponseEntity.ok(decisions);
        } catch (Exception e) {
            log.error("Error exporting decision data for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get decision statistics for a user
     *
     * @param userId The user ID
     * @return ResponseEntity with decision statistics
     */
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<Map<String, Object>> getDecisionStatistics(@PathVariable String userId) {
        try {
            log.info("Getting decision statistics for user: {}", userId);
            
            // Get analytics for different time ranges
            DecisionAnalyticsDTO weekAnalytics = decisionTrackingService.getDecisionAnalytics(userId, "7d");
            DecisionAnalyticsDTO monthAnalytics = decisionTrackingService.getDecisionAnalytics(userId, "30d");
            DecisionAnalyticsDTO quarterAnalytics = decisionTrackingService.getDecisionAnalytics(userId, "90d");
            
            Map<String, Object> statistics = Map.of(
                "userId", userId,
                "weekly", weekAnalytics,
                "monthly", monthAnalytics,
                "quarterly", quarterAnalytics,
                "generatedAt", LocalDateTime.now()
            );
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting decision statistics for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 