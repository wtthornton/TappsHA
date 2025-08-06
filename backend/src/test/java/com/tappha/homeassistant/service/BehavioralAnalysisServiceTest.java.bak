package com.tappha.homeassistant.service;

import com.theokanning.openai.service.OpenAiService;
import com.tappha.homeassistant.dto.BehavioralAnalysisRequest;
import com.tappha.homeassistant.dto.BehavioralAnalysisResponse;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for BehavioralAnalysisService
 * 
 * Tests behavioral pattern analysis with privacy-preserving techniques
 * and GPT-4o Mini integration.
 */
@ExtendWith(MockitoExtension.class)
class BehavioralAnalysisServiceTest {

    @Mock
    private OpenAiService openAiService;

    @Mock
    private HomeAssistantEventRepository eventRepository;

    @InjectMocks
    private BehavioralAnalysisService behavioralAnalysisService;

    private BehavioralAnalysisRequest testRequest;

    @BeforeEach
    void setUp() {
        // Create test request
        testRequest = BehavioralAnalysisRequest.builder()
                .userId("test-user")
                .connectionId("test-connection")
                .analysisType("daily")
                .startTime(OffsetDateTime.now().minusDays(7))
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
    }

    @Test
    void testAnalyzeBehavior_WithValidRequest_ReturnsResponse() {
        // Arrange
        when(openAiService.createChatCompletion(any())).thenReturn(mock(com.theokanning.openai.completion.chat.ChatCompletionResult.class));

        // Act
        BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(testRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-user", response.getUserId());
        assertEquals("test-connection", response.getConnectionId());
        assertEquals("daily", response.getAnalysisType());
        assertTrue(response.getIsPrivacyPreserving());
        assertEquals("high", response.getPrivacyLevel());
        assertTrue(response.getDataAnonymized());
        assertEquals("gpt-4o-mini", response.getAiModelUsed());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getExpiresAt());
        
        verify(openAiService, times(1)).createChatCompletion(any());
    }

    @Test
    void testAnalyzeBehavior_WithPrivacyPreserving_AppliesAnonymization() {
        // Arrange
        testRequest.setPrivacyLevel("high");
        testRequest.setAnonymizeData(true);
        
        when(openAiService.createChatCompletion(any())).thenReturn(mock(com.theokanning.openai.completion.chat.ChatCompletionResult.class));

        // Act
        BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(testRequest);

        // Assert
        assertNotNull(response);
        assertTrue(response.getIsPrivacyPreserving());
        assertEquals("high", response.getPrivacyLevel());
        assertTrue(response.getDataAnonymized());
    }

    @Test
    void testAnalyzeBehavior_WithLowPrivacyLevel_RetainsMoreData() {
        // Arrange
        testRequest.setPrivacyLevel("low");
        testRequest.setAnonymizeData(false);
        
        when(openAiService.createChatCompletion(any())).thenReturn(mock(com.theokanning.openai.completion.chat.ChatCompletionResult.class));

        // Act
        BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(testRequest);

        // Assert
        assertNotNull(response);
        assertFalse(response.getDataAnonymized());
        assertEquals("low", response.getPrivacyLevel());
    }

    @Test
    void testAnalyzeBehavior_WithErrorHandling_HandlesExceptions() {
        // Arrange
        when(openAiService.createChatCompletion(any()))
                .thenThrow(new RuntimeException("AI service error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            behavioralAnalysisService.analyzeBehavior(testRequest);
        });
    }

    @Test
    void testAnalyzeBehavior_WithDefaultValues_SetsCorrectDefaults() {
        // Arrange
        BehavioralAnalysisRequest requestWithDefaults = BehavioralAnalysisRequest.builder()
                .userId("test-user")
                .connectionId("test-connection")
                .analysisType("daily")
                .startTime(OffsetDateTime.now().minusDays(7))
                .endTime(OffsetDateTime.now())
                .build(); // No explicit values set
        
        when(openAiService.createChatCompletion(any())).thenReturn(mock(com.theokanning.openai.completion.chat.ChatCompletionResult.class));

        // Act
        BehavioralAnalysisResponse response = behavioralAnalysisService.analyzeBehavior(requestWithDefaults);

        // Assert
        assertNotNull(response);
        assertTrue(response.getIsPrivacyPreserving()); // Default: true
        assertEquals("high", response.getPrivacyLevel()); // Default: high
        assertTrue(response.getDataAnonymized()); // Default: true
        assertEquals(70, requestWithDefaults.getMinConfidenceThreshold()); // Default: 70
        assertEquals(10, requestWithDefaults.getMaxPatternsToReturn()); // Default: 10
        assertTrue(requestWithDefaults.getIncludeAnomalies()); // Default: true
        assertTrue(requestWithDefaults.getIncludeFrequencyAnalysis()); // Default: true
    }
} 