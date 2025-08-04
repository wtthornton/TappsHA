package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.service.PatternAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Pattern Analysis Controller
 * 
 * REST API endpoints for advanced pattern analysis and real-time alerts
 * for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/patterns")
@RequiredArgsConstructor
@Slf4j
public class PatternAnalysisController {

    private final PatternAnalysisService patternAnalysisService;

    /**
     * Analyze patterns for a specific connection
     * 
     * @param connectionId the connection ID
     * @return comprehensive pattern analysis results
     */
    @GetMapping("/analyze/{connectionId}")
    public ResponseEntity<Map<String, Object>> analyzePatterns(@PathVariable UUID connectionId) {
        log.info("Pattern analysis requested for connection: {}", connectionId);
        
        try {
            Map<String, Object> analysis = patternAnalysisService.analyzePatterns(connectionId);
            
            if (analysis.containsKey("error")) {
                return ResponseEntity.badRequest().body(analysis);
            }
            
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Pattern analysis failed for connection: {}", connectionId, e);
            Map<String, Object> error = Map.of(
                "error", "Pattern analysis failed: " + e.getMessage(),
                "connectionId", connectionId.toString()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get real-time alerts for a connection
     * 
     * @param connectionId the connection ID
     * @return list of real-time alerts
     */
    @GetMapping("/alerts/{connectionId}")
    public ResponseEntity<List<Map<String, Object>>> getRealTimeAlerts(@PathVariable UUID connectionId) {
        log.info("Real-time alerts requested for connection: {}", connectionId);
        
        try {
            List<Map<String, Object>> alerts = patternAnalysisService.getRealTimeAlerts(connectionId);
            return ResponseEntity.ok(alerts);
            
        } catch (Exception e) {
            log.error("Failed to get real-time alerts for connection: {}", connectionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get pattern analysis health status
     * 
     * @return health status information
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "service", "Pattern Analysis Service",
            "version", "1.0.0",
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.ok(health);
    }

    /**
     * Get available pattern types
     * 
     * @return list of available pattern types
     */
    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getPatternTypes() {
        Map<String, Object> patternTypes = Map.of(
            "pattern_types", List.of(
                "DAILY_ROUTINE",
                "WEEKLY_PATTERN", 
                "MONTHLY_TREND",
                "SEASONAL_CHANGE",
                "IRREGULAR_EVENT",
                "ANOMALY"
            ),
            "analysis_intervals", List.of(
                "1_day",
                "1_week", 
                "1_month",
                "6_months",
                "1_year"
            )
        );
        
        return ResponseEntity.ok(patternTypes);
    }
} 