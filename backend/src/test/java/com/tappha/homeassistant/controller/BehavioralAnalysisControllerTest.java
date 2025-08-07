package com.tappha.homeassistant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.BehavioralAnalysisRequest;
import com.tappha.homeassistant.dto.BehavioralAnalysisResponse;
import com.tappha.homeassistant.dto.BehavioralPattern;
import com.tappha.homeassistant.service.BehavioralAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for BehavioralAnalysisController
 */
@WebMvcTest(BehavioralAnalysisController.class)
class BehavioralAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BehavioralAnalysisService behavioralAnalysisService;

    @Autowired
    private ObjectMapper objectMapper;

    private BehavioralAnalysisRequest testRequest;
    private BehavioralAnalysisResponse testResponse;

    @BeforeEach
    void setUp() {
        String userId = UUID.randomUUID().toString();
        String connectionId = UUID.randomUUID().toString();

        testRequest = BehavioralAnalysisRequest.builder()
                .userId(userId)
                .connectionId(connectionId)
                .startTime(OffsetDateTime.now().minusDays(7))
                .endTime(OffsetDateTime.now())
                .analysisType("daily")
                .privacyLevel("high")
                .enablePrivacyPreserving(true)
                .anonymizeData(true)
                .minConfidenceThreshold(70)
                .maxPatternsToReturn(10)
                .includeAnomalies(true)
                .includeFrequencyAnalysis(true)
                .build();

        BehavioralPattern pattern = BehavioralPattern.builder()
                .id(UUID.randomUUID().toString())
                .patternType("daily_routine")
                .description("Morning routine pattern")
                .confidence(85.0)
                .frequency(Map.of("daily", 7, "weekly", 1))
                .build();

        testResponse = BehavioralAnalysisResponse.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .connectionId(connectionId)
                .analysisType("daily")
                .analysisStartTime(testRequest.getStartTime())
                .analysisEndTime(testRequest.getEndTime())
                .processingTimeMs(1500L)
                .patterns(List.of(pattern))
                .anomalies(List.of())
                .frequencyAnalysis(Map.of("daily", 7, "weekly", 1))
                .trendAnalysis(Map.of("increasing", true))
                .isPrivacyPreserving(true)
                .privacyLevel("high")
                .dataAnonymized(true)
                .overallConfidence(85.0)
                .totalPatternsFound(1)
                .totalAnomaliesFound(0)
                .qualityMetrics(Map.of("accuracy", 0.85, "completeness", 0.90))
                .aiModelUsed("gpt-4o-mini")
                .createdAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(30))
                .build();
    }

    @Test
    @WithMockUser(roles = "USER")
    void analyzeBehavior_Success() throws Exception {
        // Given
        when(behavioralAnalysisService.analyzeBehavior(any(BehavioralAnalysisRequest.class)))
                .thenReturn(testResponse);

        // When & Then
        mockMvc.perform(post("/api/behavioral-analysis/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testResponse.getId()))
                .andExpect(jsonPath("$.userId").value(testResponse.getUserId()))
                .andExpect(jsonPath("$.analysisType").value("daily"))
                .andExpect(jsonPath("$.totalPatternsFound").value(1))
                .andExpect(jsonPath("$.totalAnomaliesFound").value(0))
                .andExpect(jsonPath("$.overallConfidence").value(85.0))
                .andExpect(jsonPath("$.isPrivacyPreserving").value(true))
                .andExpect(jsonPath("$.patterns[0].patternType").value("daily_routine"))
                .andExpect(jsonPath("$.patterns[0].confidence").value(85));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getBehavioralAnalysis_Success() throws Exception {
        // Given
        when(behavioralAnalysisService.analyzeBehavior(any(BehavioralAnalysisRequest.class)))
                .thenReturn(testResponse);

        // When & Then
        mockMvc.perform(get("/api/behavioral-analysis/analyze/{userId}", testRequest.getUserId())
                        .param("connectionId", testRequest.getConnectionId().toString())
                        .param("startTime", testRequest.getStartTime().toString())
                        .param("endTime", testRequest.getEndTime().toString())
                        .param("analysisType", "daily")
                        .param("privacyLevel", "high"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testResponse.getUserId()))
                .andExpect(jsonPath("$.analysisType").value("daily"))
                .andExpect(jsonPath("$.totalPatternsFound").value(1))
                .andExpect(jsonPath("$.isPrivacyPreserving").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void analyzeBehavior_ServiceException() throws Exception {
        // Given
        when(behavioralAnalysisService.analyzeBehavior(any(BehavioralAnalysisRequest.class)))
                .thenThrow(new RuntimeException("Service error"));

        // When & Then
        mockMvc.perform(post("/api/behavioral-analysis/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void analyzeBehavior_Unauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/behavioral-analysis/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN") // Wrong role
    void analyzeBehavior_Forbidden() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/behavioral-analysis/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void healthCheck_Success() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/behavioral-analysis/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Behavioral Analysis Service is healthy"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void analyzeBehavior_InvalidRequest() throws Exception {
        // Given - Invalid request with null required fields
        BehavioralAnalysisRequest invalidRequest = BehavioralAnalysisRequest.builder()
                .userId(null) // Invalid - required field
                .build();

        // When & Then
        mockMvc.perform(post("/api/behavioral-analysis/analyze")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}