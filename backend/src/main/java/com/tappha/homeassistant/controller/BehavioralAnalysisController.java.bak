package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.BehavioralAnalysisRequest;
import com.tappha.homeassistant.dto.BehavioralAnalysisResponse;
import com.tappha.homeassistant.service.BehavioralAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Behavioral Analysis Controller
 * 
 * REST endpoints for behavioral pattern analysis in the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/v1/behavioral-analysis")
@RequiredArgsConstructor
@Slf4j
public class BehavioralAnalysisController {

    private final BehavioralAnalysisService behavioralAnalysisService;

    /**
     * Perform behavioral analysis
     * 
     * @param request Behavioral analysis request
     * @return Behavioral analysis response
     */
    @PostMapping("/analyze")
    public ResponseEntity<BehavioralAnalysisResponse> analyzeBehavior(
            @RequestBody BehavioralAnalysisRequest request) {
        
        try {
            log.info("Received behavioral analysis request for user: {}, connection: {}", 
                    request.getUserId(), request.getConnectionId());
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            log.info("Completed behavioral analysis. Found {} patterns, {} anomalies", 
                    response.getTotalPatternsFound(), response.getTotalAnomaliesFound());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error performing behavioral analysis", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Perform quick behavioral analysis with default parameters
     * 
     * @param userId User ID
     * @param connectionId Connection ID
     * @param analysisType Analysis type (daily, weekly, monthly)
     * @return Behavioral analysis response
     */
    @PostMapping("/analyze/quick")
    public ResponseEntity<BehavioralAnalysisResponse> quickAnalysis(
            @RequestParam String userId,
            @RequestParam String connectionId,
            @RequestParam(defaultValue = "daily") String analysisType) {
        
        try {
            log.info("Received quick behavioral analysis request for user: {}, connection: {}", 
                    userId, connectionId);
            
            // Create request with default parameters
            BehavioralAnalysisRequest request = BehavioralAnalysisRequest.builder()
                    .userId(userId)
                    .connectionId(connectionId)
                    .analysisType(analysisType)
                    .startTime(OffsetDateTime.now().minusDays(7)) // Last 7 days
                    .endTime(OffsetDateTime.now())
                    .enablePrivacyPreserving(true)
                    .privacyLevel("high")
                    .anonymizeData(true)
                    .minConfidenceThreshold(70)
                    .maxPatternsToReturn(5)
                    .includeAnomalies(true)
                    .includeFrequencyAnalysis(true)
                    .aiModel("gpt-4o-mini")
                    .temperature(0.3)
                    .maxTokens(1000)
                    .build();
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            log.info("Completed quick behavioral analysis. Found {} patterns, {} anomalies", 
                    response.getTotalPatternsFound(), response.getTotalAnomaliesFound());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error performing quick behavioral analysis", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Perform privacy-focused behavioral analysis
     * 
     * @param userId User ID
     * @param connectionId Connection ID
     * @param privacyLevel Privacy level (low, medium, high)
     * @return Behavioral analysis response
     */
    @PostMapping("/analyze/privacy-focused")
    public ResponseEntity<BehavioralAnalysisResponse> privacyFocusedAnalysis(
            @RequestParam String userId,
            @RequestParam String connectionId,
            @RequestParam(defaultValue = "high") String privacyLevel) {
        
        try {
            log.info("Received privacy-focused behavioral analysis request for user: {}, privacy: {}", 
                    userId, privacyLevel);
            
            BehavioralAnalysisRequest request = BehavioralAnalysisRequest.builder()
                    .userId(userId)
                    .connectionId(connectionId)
                    .analysisType("custom")
                    .startTime(OffsetDateTime.now().minusDays(30)) // Last 30 days
                    .endTime(OffsetDateTime.now())
                    .enablePrivacyPreserving(true)
                    .privacyLevel(privacyLevel)
                    .anonymizeData(true)
                    .minConfidenceThreshold(80) // Higher threshold for privacy-focused analysis
                    .maxPatternsToReturn(3) // Fewer patterns for privacy
                    .includeAnomalies(false) // No anomalies for privacy
                    .includeFrequencyAnalysis(false) // No frequency analysis for privacy
                    .aiModel("gpt-4o-mini")
                    .temperature(0.2) // Lower temperature for more focused analysis
                    .maxTokens(800) // Fewer tokens for privacy
                    .build();
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            log.info("Completed privacy-focused behavioral analysis. Found {} patterns", 
                    response.getTotalPatternsFound());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error performing privacy-focused behavioral analysis", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Perform comprehensive behavioral analysis
     * 
     * @param userId User ID
     * @param connectionId Connection ID
     * @param days Number of days to analyze
     * @return Behavioral analysis response
     */
    @PostMapping("/analyze/comprehensive")
    public ResponseEntity<BehavioralAnalysisResponse> comprehensiveAnalysis(
            @RequestParam String userId,
            @RequestParam String connectionId,
            @RequestParam(defaultValue = "90") Integer days) {
        
        try {
            log.info("Received comprehensive behavioral analysis request for user: {}, days: {}", 
                    userId, days);
            
            BehavioralAnalysisRequest request = BehavioralAnalysisRequest.builder()
                    .userId(userId)
                    .connectionId(connectionId)
                    .analysisType("comprehensive")
                    .startTime(OffsetDateTime.now().minusDays(days))
                    .endTime(OffsetDateTime.now())
                    .enablePrivacyPreserving(true)
                    .privacyLevel("medium") // Medium privacy for comprehensive analysis
                    .anonymizeData(true)
                    .minConfidenceThreshold(60) // Lower threshold for comprehensive analysis
                    .maxPatternsToReturn(15) // More patterns for comprehensive analysis
                    .includeAnomalies(true)
                    .includeFrequencyAnalysis(true)
                    .aiModel("gpt-4o-mini")
                    .temperature(0.4) // Higher temperature for more creative analysis
                    .maxTokens(1500) // More tokens for comprehensive analysis
                    .build();
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            log.info("Completed comprehensive behavioral analysis. Found {} patterns, {} anomalies", 
                    response.getTotalPatternsFound(), response.getTotalAnomaliesFound());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error performing comprehensive behavioral analysis", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get analysis health status
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "behavioral-analysis",
                "timestamp", OffsetDateTime.now()
        ));
    }
} 