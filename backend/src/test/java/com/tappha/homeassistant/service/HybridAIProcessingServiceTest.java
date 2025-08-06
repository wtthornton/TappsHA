package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for HybridAIProcessingService
 */
@ExtendWith(MockitoExtension.class)
class HybridAIProcessingServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private OpenAIClient openAIClient;

    @Mock
    private ObjectMapper objectMapper;

    private HybridAIProcessingService hybridAIProcessingService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        hybridAIProcessingService = new HybridAIProcessingService(
            redisTemplate,
            openAIClient,
            objectMapper
        );

        // Set test configuration via reflection
        ReflectionTestUtils.setField(hybridAIProcessingService, "hybridEnabled", true);
        ReflectionTestUtils.setField(hybridAIProcessingService, "localFirst", false);
        ReflectionTestUtils.setField(hybridAIProcessingService, "localThreshold", BigDecimal.valueOf(0.7));
        ReflectionTestUtils.setField(hybridAIProcessingService, "cachingEnabled", true);
        ReflectionTestUtils.setField(hybridAIProcessingService, "cacheTtl", 3600L);
        ReflectionTestUtils.setField(hybridAIProcessingService, "cacheKeyPrefix", "ai:suggestion:");
        ReflectionTestUtils.setField(hybridAIProcessingService, "tensorflowLiteEnabled", false);
    }

    @Test
    void testGenerateSuggestion_CacheHit() throws Exception {
        // Arrange
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        AISuggestion cachedSuggestion = createTestSuggestion();

        when(valueOperations.get(anyString())).thenReturn(cachedSuggestion);

        // Act
        CompletableFuture<AISuggestion> result = hybridAIProcessingService.generateSuggestion(context, preferences);
        AISuggestion suggestion = result.get();

        // Assert
        assertNotNull(suggestion);
        assertEquals(cachedSuggestion.getTitle(), suggestion.getTitle());
        verify(openAIClient, never()).generateSuggestion(any(), any());
        verify(valueOperations).get(anyString());
    }

    @Test
    void testGenerateSuggestion_CacheMiss_CloudProcessing() throws Exception {
        // Arrange
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        AISuggestion cloudSuggestion = createTestSuggestion();

        when(valueOperations.get(anyString())).thenReturn(null);
        when(openAIClient.generateSuggestion(context, preferences))
            .thenReturn(CompletableFuture.completedFuture(cloudSuggestion));

        // Act
        CompletableFuture<AISuggestion> result = hybridAIProcessingService.generateSuggestion(context, preferences);
        AISuggestion suggestion = result.get();

        // Assert
        assertNotNull(suggestion);
        assertEquals(cloudSuggestion.getTitle(), suggestion.getTitle());
        verify(openAIClient).generateSuggestion(context, preferences);
        verify(valueOperations).set(anyString(), eq(cloudSuggestion), eq(Duration.ofSeconds(3600)));
    }

    @Test
    void testGenerateSuggestion_CloudProcessingFailure() throws Exception {
        // Arrange
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();

        when(valueOperations.get(anyString())).thenReturn(null);
        when(openAIClient.generateSuggestion(context, preferences))
            .thenReturn(CompletableFuture.failedFuture(new RuntimeException("OpenAI API error")));

        // Act & Assert
        CompletableFuture<AISuggestion> result = hybridAIProcessingService.generateSuggestion(context, preferences);
        
        assertThrows(Exception.class, () -> result.get());
        verify(openAIClient).generateSuggestion(context, preferences);
    }

    @Test
    void testGenerateSuggestion_CachingDisabled() throws Exception {
        // Arrange
        ReflectionTestUtils.setField(hybridAIProcessingService, "cachingEnabled", false);
        
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        AISuggestion cloudSuggestion = createTestSuggestion();

        when(openAIClient.generateSuggestion(context, preferences))
            .thenReturn(CompletableFuture.completedFuture(cloudSuggestion));

        // Act
        CompletableFuture<AISuggestion> result = hybridAIProcessingService.generateSuggestion(context, preferences);
        AISuggestion suggestion = result.get();

        // Assert
        assertNotNull(suggestion);
        assertEquals(cloudSuggestion.getTitle(), suggestion.getTitle());
        verify(valueOperations, never()).get(anyString());
        verify(valueOperations, never()).set(anyString(), any(), any(Duration.class));
        verify(openAIClient).generateSuggestion(context, preferences);
    }

    @Test
    void testGenerateSuggestion_RedisException() throws Exception {
        // Arrange
        AutomationContext context = createTestContext();
        UserPreferences preferences = createTestPreferences();
        AISuggestion cloudSuggestion = createTestSuggestion();

        when(valueOperations.get(anyString())).thenThrow(new RuntimeException("Redis connection error"));
        when(openAIClient.generateSuggestion(context, preferences))
            .thenReturn(CompletableFuture.completedFuture(cloudSuggestion));

        // Act
        CompletableFuture<AISuggestion> result = hybridAIProcessingService.generateSuggestion(context, preferences);
        AISuggestion suggestion = result.get();

        // Assert
        assertNotNull(suggestion);
        assertEquals(cloudSuggestion.getTitle(), suggestion.getTitle());
        verify(openAIClient).generateSuggestion(context, preferences);
    }

    @Test
    void testGetProcessingStrategy() {
        // Act
        HybridAIProcessingService.ProcessingStrategy strategy = hybridAIProcessingService.getProcessingStrategy();

        // Assert
        assertNotNull(strategy);
        assertTrue(strategy.getHybridEnabled());
        assertFalse(strategy.getLocalFirst());
        assertEquals(BigDecimal.valueOf(0.7), strategy.getLocalThreshold());
        assertTrue(strategy.getCachingEnabled());
        assertFalse(strategy.getTensorflowLiteEnabled());
    }

    @Test
    void testCacheKeyGeneration() throws Exception {
        // Arrange
        AutomationContext context1 = createTestContext();
        AutomationContext context2 = createTestContext();
        context2.setContextId("different-context-id");
        
        UserPreferences preferences = createTestPreferences();

        when(valueOperations.get(anyString())).thenReturn(null);
        when(openAIClient.generateSuggestion(any(), any()))
            .thenReturn(CompletableFuture.completedFuture(createTestSuggestion()));

        // Act
        hybridAIProcessingService.generateSuggestion(context1, preferences).get();
        hybridAIProcessingService.generateSuggestion(context2, preferences).get();

        // Assert - Verify different cache keys are used for different contexts
        verify(valueOperations, times(2)).get(anyString());
        verify(valueOperations, times(2)).set(anyString(), any(), any(Duration.class));
    }

    private AutomationContext createTestContext() {
        AutomationContext context = new AutomationContext();
        context.setContextId("test-context-" + UUID.randomUUID());
        context.setPatternType("energy_optimization");
        context.setEntityIds(Arrays.asList("light.living_room", "sensor.temperature"));
        return context;
    }

    private UserPreferences createTestPreferences() {
        UserPreferences preferences = new UserPreferences();
        // Set default test preferences
        return preferences;
    }

    private AISuggestion createTestSuggestion() {
        AISuggestion suggestion = new AISuggestion();
        suggestion.setTitle("Test AI Suggestion");
        suggestion.setDescription("This is a test suggestion for automation improvement");
        suggestion.setAutomationConfig("{\"trigger\": [], \"action\": []}");
        suggestion.setConfidenceScore(BigDecimal.valueOf(0.85));
        suggestion.setSuggestionType(AISuggestion.SuggestionType.ENERGY_OPTIMIZATION);
        return suggestion;
    }
}