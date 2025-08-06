package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.BehavioralAnalysisRequest;
import com.tappha.homeassistant.dto.BehavioralAnalysisResponse;
import com.tappha.homeassistant.service.BehavioralAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * Behavioral Analysis Controller
 * 
 * REST API endpoints for behavioral pattern analysis with privacy-preserving techniques
 * and GPT-4o Mini integration for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/behavioral-analysis")
@RequiredArgsConstructor
@Validated
@Slf4j
@ConditionalOnBean(BehavioralAnalysisService.class)
public class BehavioralAnalysisController {

    private final BehavioralAnalysisService behavioralAnalysisService;

    /**
     * Perform behavioral analysis based on user behavior patterns
     * 
     * @param request The behavioral analysis request parameters
     * @return BehavioralAnalysisResponse with patterns, anomalies, and insights
     */
    @PostMapping("/analyze")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BehavioralAnalysisResponse> analyzeBehavior(
            @Valid @RequestBody BehavioralAnalysisRequest request) {
        
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("Starting behavioral analysis for user: {}, connection: {}", 
                    request.getUserId(), request.getConnectionId());
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            long processingTime = System.currentTimeMillis() - startTime;
            log.info("Behavioral analysis completed in {}ms for user: {}", 
                    processingTime, request.getUserId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error performing behavioral analysis for user: {}", 
                    request.getUserId(), e);
            throw new RuntimeException("Failed to perform behavioral analysis", e);
        }
    }

    /**
     * Get behavioral analysis for a specific time range
     * 
     * @param userId The user ID
     * @param connectionId The Home Assistant connection ID  
     * @param startTime Start time for analysis (ISO 8601 format)
     * @param endTime End time for analysis (ISO 8601 format)
     * @param analysisType Type of analysis (daily, weekly, monthly)
     * @param privacyLevel Privacy level (low, medium, high)
     * @return BehavioralAnalysisResponse with analysis results
     */
    @GetMapping("/analyze/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BehavioralAnalysisResponse> getBehavioralAnalysis(
            @PathVariable String userId,
            @RequestParam String connectionId,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(defaultValue = "daily") String analysisType,
            @RequestParam(defaultValue = "high") String privacyLevel) {
        
        try {
            log.info("Getting behavioral analysis for user: {}, type: {}", userId, analysisType);
            
            BehavioralAnalysisRequest request = BehavioralAnalysisRequest.builder()
                    .userId(userId)
                    .connectionId(connectionId)
                    .startTime(java.time.OffsetDateTime.parse(startTime))
                    .endTime(java.time.OffsetDateTime.parse(endTime))
                    .analysisType(analysisType)
                    .privacyLevel(privacyLevel)
                    .enablePrivacyPreserving(true)
                    .anonymizeData(true)
                    .minConfidenceThreshold(70)
                    .maxPatternsToReturn(10)
                    .includeAnomalies(true)
                    .includeFrequencyAnalysis(true)
                    .build();
            
            BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(request);
            
            log.info("Retrieved behavioral analysis for user: {}, patterns found: {}", 
                    userId, response.getTotalPatternsFound());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving behavioral analysis for user: {}", userId, e);
            throw new RuntimeException("Failed to retrieve behavioral analysis", e);
        }
    }

    /**
     * Get behavioral analysis health check
     * 
     * @return Health status of behavioral analysis service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        try {
            log.debug("Behavioral analysis health check requested");
            return ResponseEntity.ok("Behavioral Analysis Service is healthy");
        } catch (Exception e) {
            log.error("Behavioral analysis health check failed", e);
            return ResponseEntity.status(503).body("Behavioral Analysis Service is unavailable");
        }
    }
}