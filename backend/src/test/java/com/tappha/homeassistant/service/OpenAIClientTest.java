package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.exception.OpenAIException;
import com.tappha.homeassistant.exception.RateLimitException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for OpenAI API integration with rate limiting and error handling
 * 
 * Reference: https://platform.openai.com/docs/api-reference
 */
@ExtendWith(MockitoExtension.class)
class OpenAIClientTest {

    @Mock
    private RateLimiter rateLimiter;

    @Mock
    private ErrorHandler errorHandler;

    private OpenAIClient openAIClient;

    @BeforeEach
    void setUp() {
        openAIClient = new OpenAIClient(rateLimiter, errorHandler);
        ReflectionTestUtils.setField(openAIClient, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(openAIClient, "baseUrl", "https://api.openai.com/v1");
        ReflectionTestUtils.setField(openAIClient, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(openAIClient, "maxTokens", 1000);
        ReflectionTestUtils.setField(openAIClient, "temperature", 0.7);
    }

    @Test
    void shouldGenerateSuggestionSuccessfully() throws Exception {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(Exception.class))).thenReturn(false);
        
        // When
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        AISuggestion suggestion = future.get();
        
        // Then
        assertNotNull(suggestion);
        assertNotNull(suggestion.getSuggestionType());
        assertNotNull(suggestion.getSuggestionData());
        assertTrue(suggestion.getConfidence() >= 0.0 && suggestion.getConfidence() <= 1.0);
        assertTrue(suggestion.getSafetyScore() >= 0.0 && suggestion.getSafetyScore() <= 1.0);
        
        verify(rateLimiter).acquirePermission();
        verify(rateLimiter).releasePermission();
    }

    @Test
    void shouldHandleRateLimitException() {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenThrow(new RateLimitException("Rate limit exceeded"));
        when(errorHandler.handleError(any(RateLimitException.class))).thenReturn(true);
        
        // When & Then
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        
        assertThrows(ExecutionException.class, () -> future.get());
        verify(rateLimiter).acquirePermission();
        verify(errorHandler).handleError(any(RateLimitException.class));
    }

    @Test
    void shouldHandleOpenAIException() {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(OpenAIException.class))).thenReturn(true);
        
        // Mock OpenAI API to throw exception
        ReflectionTestUtils.setField(openAIClient, "apiKey", "invalid-key");
        
        // When & Then
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        
        assertThrows(ExecutionException.class, () -> future.get());
        verify(rateLimiter).acquirePermission();
        verify(rateLimiter).releasePermission();
        verify(errorHandler).handleError(any(OpenAIException.class));
    }

    @Test
    void shouldHandleNetworkTimeout() {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(Exception.class))).thenReturn(true);
        
        // Mock timeout scenario
        ReflectionTestUtils.setField(openAIClient, "timeout", Duration.ofMillis(1));
        
        // When & Then
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        
        assertThrows(ExecutionException.class, () -> future.get());
        verify(rateLimiter).acquirePermission();
        verify(rateLimiter).releasePermission();
        verify(errorHandler).handleError(any(Exception.class));
    }

    @Test
    void shouldRetryOnTransientErrors() {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(Exception.class))).thenReturn(false);
        
        // Mock transient error scenario
        ReflectionTestUtils.setField(openAIClient, "maxRetries", 3);
        
        // When
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        
        // Then
        assertDoesNotThrow(() -> future.get());
        verify(rateLimiter, atLeastOnce()).acquirePermission();
        verify(rateLimiter, atLeastOnce()).releasePermission();
    }

    @Test
    void shouldValidateInputParameters() {
        // Given
        AutomationContext nullContext = null;
        UserPreferences preferences = createTestPreferences();
        
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            openAIClient.generateSuggestion(nullContext, preferences));
        
        assertThrows(IllegalArgumentException.class, () -> 
            openAIClient.generateSuggestion(createTestContext(), null));
    }

    @Test
    void shouldHandleEmptyContext() {
        // Given
        AutomationContext emptyContext = AutomationContext.builder()
            .entityId("")
            .eventType("")
            .build();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(Exception.class))).thenReturn(false);
        
        // When
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(emptyContext, preferences);
        
        // Then
        assertThrows(ExecutionException.class, () -> future.get());
        verify(errorHandler).handleError(any(IllegalArgumentException.class));
    }

    @Test
    void shouldRespectRateLimiting() {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(false);
        
        // When & Then
        CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
        
        assertThrows(ExecutionException.class, () -> future.get());
        verify(rateLimiter).acquirePermission();
        verify(rateLimiter, never()).releasePermission();
    }

    @Test
    void shouldHandleConcurrentRequests() throws Exception {
        // Given
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        
        when(rateLimiter.acquirePermission()).thenReturn(true);
        when(errorHandler.handleError(any(Exception.class))).thenReturn(false);
        
        // When
        CompletableFuture<AISuggestion>[] futures = new CompletableFuture[5];
        for (int i = 0; i < 5; i++) {
            futures[i] = openAIClient.generateSuggestion(context, preferences);
        }
        
        // Then
        for (CompletableFuture<AISuggestion> future : futures) {
            AISuggestion suggestion = future.get();
            assertNotNull(suggestion);
        }
        
        verify(rateLimiter, times(5)).acquirePermission();
        verify(rateLimiter, times(5)).releasePermission();
    }

    private AutomationContext createTestContext() {
        return AutomationContext.builder()
            .entityId("light.living_room")
            .eventType("state_changed")
            .oldState("off")
            .newState("on")
            .timestamp(System.currentTimeMillis())
            .build();
    }

    private UserPreferences createTestPreferences() {
        return UserPreferences.builder()
            .aiEnabled(true)
            .safetyLevel("medium")
            .approvalRequired(true)
            .maxSuggestionsPerDay(10)
            .build();
    }
} 